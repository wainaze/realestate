var properties = require('./properties');
var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection.js').db.get('transactions'));
var moment = require('moment');

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

function setProperty(transaction) {
    return function(property) {
        transaction.property = property;
        return transaction;
    };
}

function bindProperty(transaction) {
    return properties.getPropertyById(transaction.propertyId)
            .then(setProperty(transaction));
}

function bindAllProperties(transactions) {
    return Promise.all(transactions.map(function(transaction){
        return bindProperty(transaction);
    }));
}

function sortAndCleanTransactions(transactions) {
    return new Promise(function(resolve) {
        transactions = transactions.filter(function(transaction){
            return transaction.property != null;
        });

        transactions.sort(function(a, b) {
            if (a.timestamp > b.timestamp) {
                return 1;
            }
            if (a.timestamp < b.timestamp) {
                return -1;
            }
            // a must be equal to b
            return 0;
        });
        transactions.reverse();
        resolve(transactions);
    });

}

function getTransactionsFromDate(userId, searchDate) {
  return records.find({userId : userId, timestamp: {$gte: searchDate}});
}

function getAllPayments(userId) {
    return records.find({userId : userId}).then(bindAllProperties).then(sortAndCleanTransactions);
}

function getTransaction(transactionId) {
    return records.findOne({id: parseInt(transactionId)});
}

function addTransaction(userId, issuePropertyId, costAmount, costDescription) {
    return getMaxId()
    .then(function(maxId){
        transaction = {
                id: maxId + 1,
                date: moment().format('DD/MM/YYYY'),
                timestamp: moment().format('YYYYMMDDHHmmss'),
                amount: costAmount,
                userId: userId,
                propertyId: issuePropertyId,
                description: costDescription
            }
        return insertTransaction(
            transaction
        );
    })
    .then(function(transaction){      
        return transaction.id;
    });
}

function insertTransaction(transaction) {
    return records.insert(transaction);
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
    ).get(0).get('maxId');
}

exports.getAllPayments = getAllPayments;
exports.addTransaction = addTransaction;
exports.getTransaction = getTransaction;
exports.getTransactionsFromDate = getTransactionsFromDate;