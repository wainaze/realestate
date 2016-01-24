var db = require('../db');
var schedule = require('node-schedule');
var Promise = require('bluebird');
var moment = require('moment');
var eventBus = require('eventBus').eventBus;

function startPaymentsGeneration(){
    var job = schedule.scheduleJob('*/5 * * * * *', function(){
    	var prom = db.contracts
    	.getContractsToPay()
    	.then(removeExistingPayments);
    });
}

function startPaymentsControle() {
	var job = schedule.scheduleJob('*/5 * * * * *', function(){
    	db.payments.updateOverduePayments();
    });
}

function addPayment(contract) {
  var dueDate = moment().date(contract.paymentDay).format('YYYYMMDD');
	return db.payments.addPayment({
		contractId : contract.id,
		propertyId : contract.propertyId,
		month : moment().format('MMMM'),
		dueDate : dueDate,
		payment : contract.payment
	});
}

function markPaymentPayed(propertyId, paymentId, paymentMoment) {
  return db.payments.markPaymentPayed(paymentId, paymentMoment)
          .then(function(){
            console.log('marked payed');
            db.payments.getAllPayments(propertyId)
            .then(function(payments){

              console.log('calculate overdue');
              var overdue = getOverdue(payments);
              if (overdue) {
                console.log('overdue');
                return db.properties.setOverdueStatus(propertyId, overdue);
              } else {
                console.log('good payed');
                return db.properties.setPayedStatus(propertyId, getPayed(payments));
              }
            });
          });
}

function getOverdue(payments) {
  var summ = 0;
  payments.filter(function(payment){return payment.overdue;}).forEach(function(payment) { summ += parseFloat(payment.payment); });
  return summ;
}

function getPayed(payments) {
  if (!payments || !payments.length)
    return 0;
  
  payments.sort(function(a,b){
    return moment(a.paymentDate, 'YYYYMMDD').diff(moment(b.v, 'YYYYMMDD'), 'days');
  });

  return parseFloat(payments[0].payment);
}

function addContractDocument(contractId, fileId, contractDocumentTitle){
  return db.contracts.addContractDocument(contractId, fileId, contractDocumentTitle);
}

function removeContractDocument(contractId, documentId) {
  return db.contracts.removeContractDocument(contractId, documentId);
}

function removeExistingPayments(contracts){
	return Promise.filter(contracts, filterExistingPayment).each(addPayment);	
}

function filterExistingPayment(contract){  	
	var dueDate = moment().date(contract.paymentDay).format('YYYYMMDD');
	return db.payments
		.getPayment(contract.id, dueDate)
		.then(function(payment){ return payment == null	});
}

function generatePaymentsBackInTime(contract) {
    var paymentDate = contract.paymentDay;
    var contractBegin = moment(contract.fromDate , "DD/MM/YYYY");
    var currentMoment = contractBegin;
    if (currentMoment.date() >= paymentDate) {
        currentMoment.add(1, 'M');
    }
    currentMoment.add(-1, 'M');
    var finalMoment = moment();
    while (currentMoment.diff(finalMoment, 'M') < 0) {
        currentMoment.add(1, 'M');
        if (paymentDate > currentMoment.daysInMonth()){
            currentMoment.date(currentMoment.daysInMonth());
        } else {
            currentMoment.date(paymentDate);
        }

        if (currentMoment.diff(finalMoment, 'd') < 0) {
            var paymentMoment = currentMoment.format('YYYYMMDD');
            db.payments.addPayment({
                    contractId: contract.id,
                    propertyId: contract.propertyId,
                    month: currentMoment.format('MMMM'),
                    dueDate: currentMoment.format('YYYYMMDD'),
                    payment: contract.payment
                })
                .then(function (payment) {
                    return markPaymentPayed(contract.propertyId, payment.id, moment(payment.dueDate, 'YYYYMMDD'));
                });
        }
    }
}

exports.startPaymentsControle = startPaymentsControle;
exports.startPaymentsGeneration = startPaymentsGeneration;
exports.addContractDocument = addContractDocument;
exports.removeContractDocument = removeContractDocument;
exports.markPaymentPayed = markPaymentPayed;

eventBus.on('contractAdded', generatePaymentsBackInTime);