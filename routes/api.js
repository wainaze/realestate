var express = require('express');
var db = require('../db');
var ensureLogin = require('connect-ensure-login');
var userAccess = require('../services/userAccessService');
var messagesService = require('../services/messagesService');
var router = express.Router();
var moment = require('moment');

// middleware specific to this router
router.use(ensureLogin.ensureLoggedIn('/'));
router.use(userAccess.userHasRole('landlord'));

router.post('/addCost', function(req, res) {
    var userId = parseInt(req.user.id);
    var issueId = parseInt(req.body.issueId);
    var costDescription = req.body.costDescription;
    var costAmount = req.body.costAmount;
    db.issues.addCost(issueId, userId, costAmount, costDescription)
    .then(function() {
            res.send('ok');
        }
    )
    .catch(function(err){
            res.send('error');
        }
    );
});

router.post('/addComment', function(req, res) {
    var userId = parseInt(req.user.id);
    var issueId = parseInt(req.body.issueId);
    var commentText = req.body.commentText;
    if (!commentText || !commentText.length)
        res.send('ok');

    db.issues.addComment(userId, issueId, commentText)
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
});

router.post('/addIssue', function(req, res){
    var userId = parseInt(req.user.id);
    var subject = req.body.issueSubject;
    var description = req.body.issueDescription;
    var propertyId = parseInt(req.body.issueProperty);
    db.issues.addIssue(userId, subject, description, propertyId)
    .then(function(issue){
        res.send( issue.id.toString());
    })
    .catch(function(err){
        res.send(err);
    })
});

router.post('/solveIssue', function(req, res) {
    var userId = parseInt(req.user.id);
    var issueId = parseInt(req.body.issueId);
    db.issues.updateIssueStatus(userId, issueId, 'solved')
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
});

router.post('/holdIssue', function(req, res) {
    var userId = parseInt(req.user.id);
    var issueId = parseInt(req.body.issueId);
    db.issues.updateIssueStatus(userId, issueId, 'on-hold')
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
});

router.post('/rejectIssue', function(req, res) {
    var userId = parseInt(req.user.id);
    var issueId = parseInt(req.body.issueId);
    db.issues.updateIssueStatus(userId, issueId, 'rejected')
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
});

router.post('/reopenIssue', function(req, res) {
    var userId = parseInt(req.user.id);
    var issueId = parseInt(req.body.issueId);
    db.issues.updateIssueStatus(userId, issueId, 'open')
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
});

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
    messagesService.getMessages(userId)
    .then(function(messages){
        res.send(messages);
    })
    .catch(function(err){
        res.send(err);
    });
});

router.post('/addMessage', function(req, res){
    var userId = req.user.id;
    var recepients = req.body.recepients;
    var messageText = req.body.messageText;
    var message = { 
        senderId : userId,
        recepients : [3],
        date : moment().format('YYYYMMDDhhmmss'),
        messageText : messageText,
        status: 'new'
    };
    db.messages.addMessage(message)
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
        console.log('payments');
        console.log(payments);
        res.send(payments);
    })
    .catch(function(err){
        res.send(err);
    });
});

module.exports = router;
