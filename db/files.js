var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection.js').db.get('files'));
var uuid = require('node-uuid');

function getNewFileId() {
  return uuid.v4();
}

function add(filename, contentType, size, data) {
  var file = {
    fileId : getNewFileId(),
    filename : filename,
    contentType : contentType,
    size : size,
    data : data
  };
  return Promise.resolve(records.insert(file));
}

function load(fileId) {
  return records.findOne({fileId : fileId});
}

exports.add = add;
exports.load = load;