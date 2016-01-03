var db = require('../db');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var moment = require('moment');

function storeFile(file) {
  return new Promise(function(resolve){
    fs.readFile(file.filelocation, function(err, data){
      if (err) throw err;
      db.files.add(file.filename, file.contentType, file.size, data)
      .then(function(storedFile){
        resolve(storedFile.fileId);
      });      
    })
  });
}

function getFile(fileId) {
  return db.files.load(fileId);
}

exports.storeFile = storeFile;
exports.getFile = getFile;