var db = require('../db');
var Promise = require('bluebird');
var moment = require('moment');

function addPropertyPhoto(propertyId, fileId){
  return db.properties.addPropertyPhoto(propertyId, fileId);
}

function removePropertyPhoto(propertyId, photoId) {
  return db.properties.removePropertyPhoto(propertyId, photoId);
}

exports.addPropertyPhoto = addPropertyPhoto;
exports.removePropertyPhoto = removePropertyPhoto;