var Promise = require('promise');
var async = require('async');

exports.series = Promise.denodeify(async.series);