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
    var userId = req.user.id;
    var issueId = req.body.issueId;
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
    var userId = req.user.id;
    var issueId = req.body.issueId;
    var commentText = req.body.commentText;
    if (commentText && commentText.length){
        var issue = db.issues.getIssue(userId, issueId);
        if (issue.comments == null)
            issue.comments = [];
        issue.comments.push(commentText);   
    }
    res.send('ok');
});

router.post('/solveIssue', function(req, res) {
    var userId = req.user.id;
    var issueId = req.body.issueId;
    var issue = db.issues.getIssue(userId, issueId);
    issue.status = 'solved';
    res.send('ok');
});

router.post('/holdIssue', function(req, res) {
    var userId = req.user.id;
    var issueId = req.body.issueId;
    var issue = db.issues.getIssue(userId, issueId);
    issue.status = 'on-hold';
    res.send('ok');
});

router.post('/rejectIssue', function(req, res) {
    var userId = req.user.id;
    var issueId = req.body.issueId;
    var issue = db.issues.getIssue(userId, issueId);
    issue.status = 'rejected';
    res.send('ok');
});

router.post('/reopenIssue', function(req, res) {
    var userId = req.user.id;
    var issueId = req.body.issueId;
    var issue = db.issues.getIssue(userId, issueId);
    issue.status = 'open';
    res.send('ok');
});

router.post('/addProperty', function(req, res) {
    var userId = req.user.id;
    var newProperty = {
        userId: userId,
        name: req.body.name,
        address: req.body.address,
        img: '/img/house1.jpg',
        issuesTotal: 0
    }
    var propertyId = db.properties.addProperty(newProperty);
    res.send('ok');
});

router.post('/removeProperty', function(req, res) {
    var userId = req.user.id;
    var propertyId = req.body.propertyId;
    db.properties.removeProperty(propertyId);
    res.send('ok');
});

router.post('/saveTenant', function(req, res) {
    var userId = req.user.id;
    var propertyId = req.body.propertyId;
    db.tenants.addTenant({
        propertyId: propertyId,
        name: req.body.tenantName,
        contractBegin: req.body.since,
        contractEnd: req.body.till,
        picture: '/img/samples/noface.jpg',
        birthDate: req.body.birthDate,
        phone: req.body.phoneNumber
    });
    res.send('ok');
});

router.get('/loadMessages', function(req, res){
    var userId = req.user.id;
    var messages = messagesService.getMessages(userId);
    res.send(messages);    
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
    db.messages.addMessage(message); 
    res.send('ok');
});

module.exports = router;
