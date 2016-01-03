var express = require('express');
var router = express.Router();
var ensureLogin = require('connect-ensure-login');
var filesService = require('../services/filesService');
var multipart = require('connect-multiparty')();

// middleware specific to this router
router.use(ensureLogin.ensureLoggedIn('/'));

router.post('/', multipart, function(req, res) {
    var file = req.files.file;
    filesService.storeFile({
      filelocation : file.path,
      filename : file.originalFilename,
      contentType: file.type,
      size: file.size
    })
    .then(function(fileId){
      res.send(fileId);
    });
});

router.get('/:fileId', function(req, res){
  var fileId = req.params.fileId;
  filesService.getFile(fileId)
  .then(function(file){
    try {
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-disposition', 'attachment;filename=' + file.filename);
    res.setHeader('Content-Length', file.size);
    res.end(new Buffer(file.data.buffer, 'binary'));
  } catch(e){
    console.error(e);
  }
  });
});

module.exports = router;