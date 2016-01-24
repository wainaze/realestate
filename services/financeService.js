var db = require('../db');
var Promise = require('bluebird');
var moment = require('moment');

function getIncomeOfTheYear(userId) {
  // FIXME no fixed dates
  var yearBegin = '20150101';
  return db.transactions.getTransactionsFromDate(userId, yearBegin)
            .then(function(transactions){
              return transactions
                        .filter(function(transaction) { return transaction.amount > 0 })
                        .map(function(transaction) { return transaction.amount; })
                        .reduce(function(prev, curr) {
                            return  prev + curr;
                        }, 0);
            });
}

function getCostsOfTheYear(userId) {
  // FIXME no fixed dates
  var yearBegin = '20150101';
  return db.transactions.getTransactionsFromDate(userId, yearBegin)
      .then(function(transactions){
          return transactions
              .filter(function(transaction) { return transaction.amount < 0 })
              .map(function(transaction) { return transaction.amount; })
              .reduce(function(prev, curr) {
                  return  prev + curr;
              }, 0);
      });
}

exports.getIncomeOfTheYear = getIncomeOfTheYear;
exports.getCostsOfTheYear = getCostsOfTheYear;