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