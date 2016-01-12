var express = require('express');
var router = express.Router();
var moment = require('moment');
var Promise = require('bluebird');
var multipart = require('connect-multiparty')();
var ensureLogin = require('connect-ensure-login');

var db = require('../db');
var messagesService = require('../services/messagesService');
var filesService = require('../services/filesService');
var contractsService = require('../services/contractsService');
var propertiesService = require('../services/propertiesService');

var paymentsController = require('../controllers/paymentsController');
var problemsController = require('../controllers/problemsController');

router.use(ensureLogin.ensureLoggedIn('/'));

router.post('/addCost', problemsController.processAddCost);
router.post('/addComment', problemsController.processAddComment);
router.post('/addIssue', problemsController.processAddProblem);
router.post('/solveIssue', problemsController.processIssueSolved);
router.post('/holdIssue', problemsController.processIssueOnHold);
router.post('/rejectIssue', problemsController.processIssueRejected);
router.post('/reopenIssue',problemsController.processIssueReopend);

router.post('/addProperty', function(req, res) {
    var userId = parseInt(req.user.id);
    var newProperty = {
        userId: userId,
        name: req.body.name,
        address: req.body.address,
        img: '/img/house1.jpg',
        issuesTotal: 0
    }
    db.properties.addProperty(newProperty)
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
});

router.post('/removeProperty', function(req, res) {
    var userId = parseInt(req.user.id);
    var propertyId = parseInt(req.body.propertyId);
    db.properties.removeProperty(propertyId)
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
});

router.post('/property/:propertId/photo', multipart, function(req, res) {
    var file = req.files.file;
    var propertId = parseInt(req.params.propertId);
    storeFile(file)
    .then(addPropertyPhoto(propertId, file))
    .then(sendPhoto(res));
});

router.delete('/property/:propertId/photo/:photoId', function(req, res){
    var propertId = parseInt(req.params.propertId);
    var photoId = req.params.photoId;
    // FIXME remove file from DB
    removePropertyPhoto(propertId, photoId)
    .then(sendOk(res));
});

router.post('/saveContract', function(req, res) {
    var userId = parseInt(req.user.id);
    var contractId = (req.body.contractId == '' ? null : parseInt(req.body.contractId));

    if (contractId) {
        db.contracts.getContractById(contractId)
        .then(function(contract){
            if (contract.tenant && !req.body.tenantName) {
              // FIXME remove tenant
              return null;
            }  else if (contract.tenant && req.body.tenantName) {
              return updateTenant(req, contract.tenant);
            } else {
              return addTenant(req);
            }
        })       
        .then(function(tenantId){
            return db.contracts.updateContract({
                id: contractId,
                propertyId: parseInt(req.body.propertyId),
                contractCaption: req.body.contractCaption,
                fromDate: req.body.fromDate,
                tillDate: req.body.tillDate,
                paymentFrequency: req.body.paymentFrequency,
                payment: req.body.payment,
                paymentDay: parseInt(req.body.paymentDay),
                tenantId: tenantId
            })
        })
        .then(function(){
            res.send('ok');
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });   
    } else {
        var propertyId = parseInt(req.body.propertyId);
        Promise.if(req.body.tenantName != null, addTenant(req))
        .then(function(tenantId){
            return db.contracts.addContract({
                propertyId: parseInt(req.body.propertyId),
                contractCaption: req.body.contractCaption,
                fromDate: req.body.fromDate,
                tillDate: req.body.tillDate,
                paymentFrequency: req.body.paymentFrequency,
                payment: req.body.payment,  
                paymentDay: parseInt(req.body.paymentDay),
                tenantId: tenantId
            })
        })
        .then(function(){
            res.send('ok');
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });   
    }         
});

router.post('/contract/:contractId/document', multipart, function(req, res){
    var file = req.files.file;
    var contractId = parseInt(req.params.contractId);
    storeFile(file)
    .then(addContractDocument(contractId, file))
    .then(sendDocument(res));
});

router.delete('/contract/:contractId/document/:documentId', function(req, res){
    var contractId = parseInt(req.params.contractId);
    var documentId = req.params.documentId;
    // FIXME remove file from DB
    removeContractDocument(contractId, documentId)
    .then(sendOk(res));
});

function removeContractDocument(contractId, documentId){
    return contractsService.removeContractDocument(contractId, documentId);   
}

function removePropertyPhoto(propertId, photoId){
    return propertiesService.removePropertyPhoto(propertId, photoId);   
}

function sendOk(res) {
    return function() {
        res.sendStatus(200);
    }
}

function storeFile(file){
    return filesService.storeFile({
      filelocation : file.path,
      filename : file.originalFilename,
      contentType: file.type,
      size: file.size
    });    
}

function sendDocument(res) {
    return function(document) {
        res.send(document);
    }
}

function sendPhoto(res) {
    return function(photo) {
        res.send(photo);
    }
}

function addPropertyPhoto(propertId, file) {
    return function(fileId) {
        return propertiesService.addPropertyPhoto(propertId, fileId);     
    };
}

function addContractDocument(contractId, file) {
    return function(fileId) {
        return contractsService.addContractDocument(contractId, fileId, file.originalFilename);     
    };
}

function addTenant(req) {
    return db.tenants.addTenant({
        landlordId: req.user.id,
        tenantName: req.body.tenantName,
        birthDate: req.body.birthDate,
        phonenumber: req.body.phonenumber,
        email: req.body.email,
    });    
}

function updateTenant(req, tenant) {
    return db.tenants.updateTenant({
        id: tenant.id,
        landlordId: req.user.id,
        tenantName: req.body.tenantName,
        birthDate: req.body.birthDate,
        phonenumber: req.body.phonenumber,
        email: req.body.email,
    });    
}

router.post('/saveTenant', function(req, res) {
    var userId = parseInt(req.user.id);
    var propertyId = parseInt(req.body.propertyId);
    db.tenants.addTenant({
        propertyId: propertyId,
        name: req.body.tenantName,
        contractBegin: req.body.since,
        contractEnd: req.body.till,
        picture: '/img/samples/noface.jpg',
        birthDate: req.body.birthDate,
        phone: req.body.phoneNumber
    })
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
});

router.get('/loadMessages', function(req, res){
    var userId = req.user.id;
    var dialogId = parseInt(req.query.dialogId);
    console.log('dialogId');
    console.log(dialogId);
    db.messages.setDialogViewed(dialogId, userId)
    .then(function() {
        return db.messages.getDialogMessages(dialogId);
    })
    .then(function(messages){
        messages.forEach(function(message){
            message.mine = message.userId == userId;
        });
        res.send(messages);
    })    
});

router.post('/addMessage', function(req, res){
    var userId = req.user.id;
    var dialogId = parseInt(req.body.dialogId);
    var messageText = req.body.messageText;
    var message = { 
        userId : userId,
        timestamp : moment().format('YYYYMMDDHHmmss'),
        text : messageText
    };
    db.messages.addMessage(dialogId, message)
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
});

router.post('/addDialog', function(req, res){
    var userId = req.user.id;
    var recepients = JSON.parse(req.body.recepients);
    recepients.push(userId);
    var title = req.body.title;
    var messageText = req.body.message;
    var dialog = {
        caption : title,
        users: recepients,
        messages: []
    };
    var message = { 
        userId : userId,
        timestamp : moment().format('YYYYMMDDHHmmss'),
        text : messageText
    };
    db.messages.addDialog(dialog)
    .then(function(dialogId){
        return db.messages.addMessage(dialogId, message);
    })
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
});

router.get('/propertyPayments', function(req, res){
    var propertyId = parseInt(req.query.id);
    db.payments.getLastYearPayments(propertyId)
    .then(function(payments){
        payments = payments.map(function(payment){
            return payment.payment;
        });
        res.send(payments);
    })
    .catch(function(err){
        res.send(err);
    });
});

router.post('/paymentPayed', function(req, res){
    var paymentId = parseInt(req.body.id);
    var propertyId = parseInt(req.body.propertyId);
    contractsService.markPaymentPayed(propertyId, paymentId)
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
});

module.exports = router;
