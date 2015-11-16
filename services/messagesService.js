var db = require('../db');
var extend = require('util')._extend;

// FIXME 
exports.getMessages = function(userId){
    var messagesDAOs = db.messages.getMessages(userId); 
    console.log(JSON.stringify(messagesDAOs));
    var messages = messagesDAOs.map(function(messageDAO){
    	return mapFromMessageDAO(messageDAO);
    });
    return messages;
}

function mapFromMessageDAO(messageDAO) {
	var message = extend({}, messageDAO);
	var senderDAO = db.users.getUser(message.senderId);
	message.sender = mapUserFromDAO(senderDAO);
	message.recipients = message.recepients.map(function(recipientId){
		return mapUserFromDAO(db.users.getUser(recipientId));
	}); 
	return message;
}

function mapUserFromDAO(userDAO){
	return  {
	    displayName: userDAO.displayName,
	    photo: userDAO.photo,
	    emails: userDAO.emails
	}
}