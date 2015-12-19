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

router.get('/', function(req, res) {
	res.redirect('payments.html');	
});

router.get('/problems.html', function(req, res) {
	var property = req.property;
    db.issues.getOpenIssuesForProperty(property.id)
    .then(function(issues){
        res.render('tenant/problems', {
            user: req.user,
            issues: issues
        });
    });    
});

router.get('/payments.html', function(req, res) {
	var property = req.property;
    db.payments.getPayments(property.id)
    .then(function(payments){
        res.render('tenant/payments', {
            user: req.user,
            payments: payments,
        }); 
    });    
});


router.get('/messages.html', function(req, res) {
    var userId = req.tenant.userId;
    var data = {};
    db.messages.getDialogs(userId).
    then(function(dialogs){
        res.render('tenant/messages', {
            user : req.user,
            dialogs : dialogs,
            messages : []
        });    
    });
});

router.get('/documents.html', function(req, res) {
    res.render('tenant/documents', {
        user: req.user,
    });
});

module.exports = router;