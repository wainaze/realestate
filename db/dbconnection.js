var mongo = require('mongodb');
var monk = require('monk');

var host = process.env.OPENSHIFT_MONGODB_DB_HOST ? process.env.OPENSHIFT_MONGODB_DB_HOST : '127.0.0.1';
var port = process.env.OPENSHIFT_MONGODB_DB_PORT ? process.env.OPENSHIFT_MONGODB_DB_PORT : '27017';
var username = process.env.OPENSHIFT_MONGODB_DB_USERNAME ? process.env.OPENSHIFT_MONGODB_DB_USERNAME : '';
var password = process.env.OPENSHIFT_MONGODB_DB_PASSWORD ? process.env.OPENSHIFT_MONGODB_DB_PASSWORD : '';

console.log('Connect to DB: ' + JSON.stringify({host: host, port: port, username : username, password: password}));
var db = monk(host + ':' + port + '/web', {
  username : username,
  password : password
});

exports.db = db;