var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection.js').db.get('messages'));

exports.getMessages = function(userId){
    return records.find({ $or : [{senderId : 3}, {recepients : 3}] });
}

exports.addMessage = function(message){
    var newId = Math.max.apply(Math, records.map(function(o) {
        return o.id;
    })) + 1;

    message.id = newId;
    records.push(message);
    return newId;
}

exports.getMessage = function(messageId) {
    return records.findOne({ id : messageId });  
}