var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection.js').db.get('payments'));

exports.geyPayments = function(propertyId){
    return records.find({propertyId : propertyId});
}

exports.getLastYearPayments = function(propertyId) {
    //FIXME 
    return Promise.resolve(records.find({propertyId : propertyId}, {sort : { monthId : 1 }}));
}