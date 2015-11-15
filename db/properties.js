var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection.js').db.get('properties'));
var commonExceptions = require('../common/commonExceptions');

exports.getProperty = function(userId, propertyId) {
    //throw new AccessNotAllowed();
    return records.findOne({id : parseInt(propertyId), userId : parseInt(userId)});
}

exports.getPropertyById = function(propertyId) {
    console.log('Getting property by id ' + propertyId);
    //throw new AccessNotAllowed();
    return records.findOne({id : parseInt(propertyId)});
}

exports.getAllProperties = function(userId){
    return records.find({userId : userId});
};

exports.getAllPropertiesIds = function(userId){
    console.log('getting all the ids');
    return new Promise(function(resolve){
        resolve([1,2,3]);
    });
    //return records.find({userId : userId}, { id : 1 });
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