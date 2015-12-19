var Promise = require('bluebird');
var moment = require('moment');
var records = Promise.promisifyAll(require('./dbconnection.js').db.get('payments'));

exports.addPayment = function(payment) {
    console.log("Add payment");
    console.log(payment);
    return getMaxId()
    .then(function(maxId){
        payment.id = maxId + 1;
        return records.insert(payment);
    })
    .then(function(payment){      
        return payment.id;
    });
}

exports.markPaymentPayed = function(paymentId) {
	return Promise.resolve(records.update({ id : paymentId} , { $set : {payed : true, overdue: false, paymentDate : moment().format('YYYYMMDD') }}));
}

exports.getPayment = function(contractId, dueDate){
	return records.findOne({contractId : contractId, dueDate: dueDate});
}

exports.getPayments = function(propertyId){
    return records.find({propertyId : propertyId})
    		.then(convertDatesToPresent)
    		.then(sortByDateDescending);
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
    	console.log(result);
    	if (!result)
    		return 0;
    	return result.maxId;
    });
}