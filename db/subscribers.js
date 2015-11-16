var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection').db.get('subscribers'));

exports.addEmail = function(email) {
	return Promise.resolve(records.findOne({email: email}))
			.then(function(subscriber){
				if (!subscriber)
					return records.insert({email : email});
				else
					return subscriber;
			});
}

exports.getAllSubscribers = function(){
    console.log('Retrieving emails'); 
	return records.find();
}	