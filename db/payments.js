var Promise = require('bluebird');
var moment = require('moment');
var records = Promise.promisifyAll(require('./dbconnection.js').db.get('payments'));
var uuid = require('node-uuid');
var eventBus = require('eventBus').eventBus;

function getNewId() {
    return uuid.v4();
}

exports.addPayment = function(payment) {
    payment.id = getNewId();
    return records.insert(payment)
    .then(function(payment){
        eventBus.emit('paymentAdded', payment);
        return payment;
    });
}

function getAllPayments(propertyId) {
  return records.find({ propertyId : propertyId});
}

exports.markPaymentPayed = function(paymentId, paymentMoment) {
	return Promise.resolve(records.update({ id : paymentId} , { $set : {payed : true, overdue: false, paymentDate : paymentMoment.format('YYYYMMDD') }}));
}

exports.getPayment = function(contractId, dueDate){
	return records.findOne({contractId : contractId, dueDate: dueDate});
}

exports.getPayments = function(propertyId){
    return records.find({propertyId : propertyId})
        .then(sortByDateDescending)
        .then(convertDatesToPresent);
}

exports.getLastYearPayments = function(propertyId) {
    return Promise.resolve(records.find({propertyId : propertyId}, {sort : { monthId : 1 }}));
}

exports.updateOverduePayments = function() {
	return records.update({
        	dueDate: { 
        		$gte : moment().add(-3, 'days').format('YYYYMMDD'),
        		$lt : moment().format('YYYYMMDD')
        	},
	        paymentDate: {$exists: false}
	    },
	    { 
	    	$set: { overdue: true }
        },
        {
        	multi: true
        }
	);
}

function sortByProperty(arr, prop) {
	return arr.sort(function(a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        }
        if (a[prop] < b[prop]) {
            return -1;
        }
        // a must be equal to b
        return 0;
    });
}

function sortByPropertyDesc(arr, prop) {
	return arr.sort(function(a, b) {
        if (a[prop] > b[prop]) {
            return -1;
        }
        if (a[prop] < b[prop]) {
            return 1;
        }
        // a must be equal to b
        return 0;
    });
}

/* internal functions */
function sortByDateDescending(payments){
	return sortByPropertyDesc(payments, 'dueDate');
}
	
function convertDatesToPresent(payments) {
	payments.forEach(function(payment){
		if (payment.dueDate)
			payment.dueDate = moment(payment.dueDate, 'YYYYMMDD').format('DD/MM/YYYY');
		if (payment.paymentDate)
			payment.paymentDate = moment(payment.paymentDate, 'YYYYMMDD').format('DD/MM/YYYY');
	});
	return payments;
}


records.aggregate = function(aggregation){
    var collection = this.col;
    var options = {};
    return new Promise(function(resolve) {
        collection.aggregate(aggregation, options, function(err, data){
            if (err) throw err;             
            resolve(data);
        });
    });
}

function getMaxId() {
    return records.aggregate(
       [
          {
            $group : {
               _id : null,
               maxId: { $max: "$id" }
            }
          }
       ]
    ).get(0).then(function(result){
    	if (!result)
    		return 0;
    	return result.maxId;
    });
}

exports.getAllPayments = getAllPayments;