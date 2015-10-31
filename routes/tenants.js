var express = require('express');
var db = require('../db');
var ensureLogin = require('connect-ensure-login');
var userAccess = require('../services/userAccessService');
var router = express.Router();

// middleware specific to this router
router.use(ensureLogin.ensureLoggedIn('/'));
router.use(userAccess.userHasRole('tenant'));
router.use(function(req, res, next){
    var userId = req.user.id;
	var tenant = db.tenants.getTenantByUserId(userId);
	if (tenant) {
		req.tenant = tenant;
		next();
	} else {
		res.redirect('/logout');	
	}	
});

router.get('/', function(req, res) {
	res.redirect('payments.html');	
});

// define the home page route
router.get('/problems.html', function(req, res) {
	var tenant = req.tenant;
    var property = db.properties.getProperty(tenant.propertyId);
    var issues = db.issues.getOpenIssuesForProperty(property.id);

    res.render('tenant/problems', {
        user: req.user,
        issues: issues
    });
});

// define the home page route
router.get('/payments.html', function(req, res) {
	var tenant = req.tenant;
    var property = db.properties.getProperty(tenant.propertyId);
    var payments = db.payments.geyPayments(property.id);

    res.render('tenant/payments', {
        user: req.user,
        payments: payments,
    });
});

// define the home page route
router.get('/documents.html', function(req, res) {
	var tenant = req.tenant;
    var property = db.properties.getProperty(tenant.propertyId);

    res.render('tenant/documents', {
        user: req.user,
    });
});

module.exports = router;