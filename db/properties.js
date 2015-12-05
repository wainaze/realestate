var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection.js').db.get('properties'));
var commonExceptions = require('../common/commonExceptions');

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

exports.getProperty = function(userId, propertyId) {
    //throw new AccessNotAllowed();
    return records.findOne({id : parseInt(propertyId), userId : parseInt(userId)});
}

exports.getPropertyById = function(propertyId) {
    return records.findOne({id : parseInt(propertyId)});
}

exports.getAllProperties = function(userId){
    return records.find({userId : userId});
};

exports.getAllPropertiesIds = function(userId){
    return records.find({userId : parseInt(userId)}, { id : 1 }).then(function(ids){
        return ids.map(function(id){
            return id.id;
        })
    });
};

exports.addProperty = function(property){
    return getMaxId()
    .then(function(maxId){
        property.id = maxId + 1;
        return records.insert(property);
    })
    .then(function(property){      
        return property.id;
    });
};

exports.removeProperty = function(propertyId) {
    return Promise.resolve(records.remove( { id: propertyId } ));
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