var users = require('./users')
var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection.js').db.get('messages'));

exports.addDialog = function(dialog){
    return getMaxId()
    .then(function(maxId){
        dialog.id = maxId + 1;
        return records.insert(dialog);
    })
    .then(function(dialog){      
        return dialog.id;
    });
}

exports.getDialogs = function(userId){
    return records.find({ users : userId }, { messages : 0})
    		.then(bindDialogsUsers);
}

exports.getDialogMessages = function(dialogId){
	return records.findOne({ id : dialogId })
					.then(function(dialog) {return dialog.messages})
					.then(bindMessagesUsers);  
}

exports.addMessage = function(dialogId, message){
	return Promise.resolve(records.update({id: dialogId}, {$push: { messages: message } }));
}

exports.getMessage = function(messageId) {
    return records.findOne({ id : messageId });  
}

function bindDialogUsers(dialog) {
    return users.getUsersByIds(dialog.users).then(function(users) { dialog.users = users; return dialog; } );
}

function bindDialogsUsers(dialogs) {
    return Promise.all(dialogs.map(function(dialog){
        return bindDialogUsers(dialog);
    }));
}

function bindMessageUser(message) {
    return users.getUserById(message.userId).then(function(user) { message.user = user; return message; } );
}

function bindMessagesUsers(messages) {
    return Promise.all(messages.map(function(message){
        return bindMessageUser(message);
    }));
}


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