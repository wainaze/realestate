var records = require('./dbconnection.js').db.get('properties');

exports.getProperty = function(propertyId, callback) {
    return records.findOne({id: propertyId}, callback);
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