var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection.js').db.get('properties'));
var uuid = require('node-uuid');

function getNewId() {
  return uuid.v4();
}

exports.getProperty = function(userId, propertyId) {
    return records.findOne({id : propertyId, userId : userId});
}

exports.getPropertyById = function(propertyId) {
    return records.findOne({id : propertyId});
}

exports.getAllProperties = function(userId){
    return records.find({userId : userId});
};

exports.getAllPropertiesIds = function(userId){
    return records.find({userId : userId}, { id : 1 }).then(function(ids){
        return ids.map(function(id){
            return id.id;
        })
    });
};

exports.addProperty = function(property){
    property.id = getNewId();
    property.photos = [];
    return records.insert(property)
        .then(function(property){
            return property.id;
        });
};

exports.removeProperty = function(propertyId) {
    return Promise.resolve(records.remove( { id: propertyId } ));
}

function addPropertyPhoto(propertyId, fileId){
    var propertyPhoto = {
        id : getNewId(),
        fileId : fileId,
        propertyId : propertyId
    };
    return Promise.resolve(records.update({id: propertyId}, {$push: { photos: propertyPhoto } })).then(function(){ return propertyPhoto; });
}

function removePropertyPhoto(propertyId, photoId) {
    return Promise.resolve(records.update({id: propertyId}, {$pull: { photos: {id : photoId }}}));
}

function setOverdueStatus(propertyId, amount) {
    return Promise.resolve(records.update({id: propertyId}, {$set: { payment : -amount }}));
}
function setPayedStatus(propertyId, amount) {
    return Promise.resolve(records.update({id: propertyId}, {$set: { payment : amount }}));
}

exports.addPropertyPhoto = addPropertyPhoto;
exports.removePropertyPhoto = removePropertyPhoto;
exports.setOverdueStatus = setOverdueStatus;
exports.setPayedStatus = setPayedStatus;