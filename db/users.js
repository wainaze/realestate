var records = require('./dbconnection.js').db.get('users');

exports.getUser = function(userId, callback) {
    return records.findOne({ id: userId }, callback);     
}

exports.findById = function(id, callback) {
    process.nextTick(function() {
        records.findOne({ id: id })
        .on('success', function (doc) {
            callback(null, doc);   
        })
        .on('error', function(err){
            callback(new Error('User ' + id + ' does not exist'));    
        });
    });
}

exports.findByUsername = function(username, callback) {
    process.nextTick(function() {
        records.findOne({ username: username })
        .on('success', function (doc) {
            callback(null, doc);   
        })
        .on('error', function(err){
            callback(null, null);    
        });
    });
}
