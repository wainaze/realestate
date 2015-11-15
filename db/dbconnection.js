var mongo = require('mongodb');
var monk = require('monk');

var host = process.env.OPENSHIFT_MONGODB_DB_HOST ? process.env.OPENSHIFT_MONGODB_DB_HOST : '127.0.0.1';
var port = process.env.OPENSHIFT_MONGODB_DB_PORT ? process.env.OPENSHIFT_MONGODB_DB_PORT : '27017';

console.log('Connect to DB: ' + JSON.stringify({host: host, port: port}));
var db = monk(host + ':' + port + '/web', {
  username : 'azurent',
  password : 'ZjdtsdfYsdof'
});

exports.db = db;