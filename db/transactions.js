var properties = require('./properties');
var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection.js').db.get('transactions'));

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

exports.getAllPayments = function(userId) {
    return records.find({userId : userId}).then(bindAllProperties).then(sortAndCleanTransactions);
}

exports.getTransaction = function(transactionId) {
    return records.findOne({id: parseInt(transactionId)});
}

exports.addTransaction = function(userId, issuePropertyId, costAmount, costDescription) {
    return getMaxId()
    .then(function(maxId){
        transaction = {
                id: maxId + 1,
                date: '17/10/2015',
                timestamp: '20151017',
                amount: -costAmount,
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
