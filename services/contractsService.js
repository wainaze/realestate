var db = require('../db');
var schedule = require('node-schedule');
var Promise = require('bluebird');
var moment = require('moment');

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

function markPaymentPayed(propertyId, paymentId) {
  return db.payments.markPaymentPayed(paymentId)
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

exports.startPaymentsControle = startPaymentsControle;
exports.startPaymentsGeneration = startPaymentsGeneration;
exports.addContractDocument = addContractDocument;
exports.removeContractDocument = removeContractDocument;
exports.markPaymentPayed = markPaymentPayed;