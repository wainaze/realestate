var db = require('../db');
var schedule = require('node-schedule');
var Promise = require('bluebird');
var moment = require('moment');

exports.startPaymentsGeneration = function(){
    var job = schedule.scheduleJob('*/5 * * * * *', function(){
    	var prom = db.contracts
    	.getContractsToPay()
    	.then(removeExistingPayments);
    });
}

exports.startPaymentsControle = function() {
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

function removeExistingPayments(contracts){
	return Promise.filter(contracts, filterExistingPayment).each(addPayment);	
}

function filterExistingPayment(contract){  	
	var dueDate = moment().date(contract.paymentDay).format('YYYYMMDD');
	return db.payments
		.getPayment(contract.id, dueDate)
		.then(function(payment){ return payment == null	});
}