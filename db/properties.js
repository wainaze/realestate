var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection.js').db.get('properties'));
var commonExceptions = require('../common/commonExceptions');

exports.getProperty = function(userId, propertyId) {
    //throw new AccessNotAllowed();
    return records.findOne({id : parseInt(propertyId), userId : parseInt(userId)});
}

exports.getAllProperties = function(userId){
    return records.find({userId : userId});
};

exports.addProperty = function(property){
    var newId = Math.max.apply(Math, records.map(function(o) {
        return o.id;
    })) + 1;

    property.id = newId;
    records.push(property);
	return newId;
};

exports.removeProperty = function(propertyId) {
	records = records.filter(function(property){
		return property.id != propertyId;
	});
}