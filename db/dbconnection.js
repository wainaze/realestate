var mongo = require('mongodb');
var monk = require('monk');

var host = process.env.OPENSHIFT_MONGODB_DB_HOST ? process.env.OPENSHIFT_MONGODB_DB_HOST : '127.0.0.1';
var port = process.env.OPENSHIFT_MONGODB_DB_PORT ? process.env.OPENSHIFT_MONGODB_DB_PORT : '27017';

var connectionString = '';
if (process.env.OPENSHIFT_MONGODB_DB_HOST) {
	connectionString = 'mongodb://admin:CEKcvaGRqGDG@' + host + ':' + port + '/web';		
} else {
	connectionString = host + ':' + port + '/web';	
}

var db = monk(connectionString);

exports.db = db;