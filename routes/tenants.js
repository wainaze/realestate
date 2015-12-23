var express = require('express');
var db = require('../db');
var ensureLogin = require('connect-ensure-login');
var userAccess = require('../services/userAccessService');
var router = express.Router();

// middleware specific to this router
router.use(ensureLogin.ensureLoggedIn('/'));
router.use(userAccess.userHasRole('tenant'));
router.use(function(req, res, next){
    var userId = parseInt(req.user.id);
	db.tenants.getTenantByUserId(userId)
    .then(function(tenant){
        if (!tenant) {
            res.redirect('/logout');
            return;
        }       

        req.tenant = tenant;
        return db.properties.getPropertyById(tenant.propertyId)
        
    })	
    .then(function(property){
        req.property = property;
        next();
    });    
});
router.use(function(req, res, next) {
    req.data = {status : {} }; 
    next();      
});
router.use(function(req, res, next) {
    db.messages.getUnreadDialogsCount(req.user.id)
    .then(function(unreadMessagesCount){
        req.data.status.unreadMessagesCount = unreadMessagesCount;
        next();
    });    
});

router.get('/', function(req, res) {
	res.redirect('payments.html');	
});

router.get('/problems.html', function(req, res) {
	var property = req.property;
    db.issues.getOpenIssuesForProperty(property.id)
    .then(function(issues){
        res.render('tenant/problems', {
            user: req.user,
            status: { unreadMessagesCount : req.data.status.unreadMessagesCount },
            issues: issues
        });
    });    
});

router.get('/problem.html', function(req, res) {
    var data = { status : {}};
    var issueId = parseInt(req.query.issueId);
    db.issues.getIssue(issueId)
    .then(function(issue){ 
        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.issue = issue;
        data.costs = issue.costs;
        if (data.issue) {
            res.render('tenant/problem', data);
        } else {
            res.redirect('problems.html');
        }
    });
});


router.get('/addIssue.html', function(req, res) {
    var property = req.property;
    var data = {status : {}};
    data.user = req.user;
    data.status.totalNewIssues = req.data.status.newIssuesCount;
    data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
    data.property = property;
    res.render('tenant/addIssue', data);
});

router.get('/payments.html', function(req, res) {
	var property = req.property;
    db.payments.getPayments(property.id)
    .then(function(payments){
        res.render('tenant/payments', {
            user: req.user,
            status: { unreadMessagesCount : req.data.status.unreadMessagesCount },
            payments: payments,
        }); 
    });    
});


router.get('/messages.html', function(req, res) {
    var userId = req.tenant.userId;
    var data = {};
    db.messages.getDialogs(userId)
    .then(function(dialogs){
        res.render('tenant/messages', {
            user : req.user,
            dialogs : dialogs,
            status: { unreadMessagesCount : req.data.status.unreadMessagesCount },
            messages : []
        });    
    });
});

router.get('/documents.html', function(req, res) {
    res.render('tenant/documents', {
        user: req.user,
        status: { unreadMessagesCount : req.data.status.unreadMessagesCount },
    });
});

module.exports = router;