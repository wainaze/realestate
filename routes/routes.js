var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('../db');
var ensureLogin = require('connect-ensure-login');
var elasticMailService = require('../services/elasticMailService');
var emailService = require('../services/emailService');

function getTotalDue(properties){
	var due = 0;
	properties.forEach(function(property){
		if (property.payment < 0)
			due += property.payment; 
	});

	return Math.abs(due);
}

function getTotalIssues(properties){
	var totalIssues = 0;
	properties.forEach(function(property){
		var issues = db.issues.getOpenIssuesForProperty(property.id);
		totalIssues += issues.length;
	});
	return totalIssues;
}

function getTotalNewIssues(properties){
	var totalNewIssues = 0;
	properties.forEach(function(property){
		var issues = db.issues.getOpenIssuesForProperty(property.id);
		issues = issues.filter(function(issue){
			return issue.status == 'new';
		});
		totalNewIssues += issues.length;
	});
	return totalNewIssues;
}

passport.use(new Strategy(
    function(username, password, cb) {
        db.users.findByUsername(username, function(err, user) {
            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false);
            }
            if (user.password != password) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    }));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    db.users.findById(id, function(err, user) {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    });
});

module.exports = (function() {
    var express = require('express');
    var router = express.Router();

    router.get('/', function(req, res) {
        res.redirect('/index.html');
    });

    router.get('/index.html', function(req, res) {
        res.render('index', {});
    });

    router.get('/properties.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);

        var totalDue = getTotalDue(properties);
        var totalIssues = getTotalIssues(properties);
        var totalNewIssues = getTotalNewIssues(properties);

        res.render('properties', {
            user: req.user,
            status: {
                due: totalDue,
                totalIssues: totalIssues,
                newIssues: totalNewIssues,
                totalIncome: '39.800',
                totalCosts: '12.564'
            },
            properties: properties
        });
    });

    router.get('/paymentStatus.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);
        var totalIssues = getTotalIssues(properties);
        res.render('paymentStatus', {
            status: {
              totalIssues: totalIssues
        	},
            user: req.user
        });
    });

    router.get('/payments.html',  ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);
        var totalIssues = getTotalIssues(properties);

        var transactions = db.transactions.getAllPayments(userId);
        res.render('payments', {
            status: {
              totalIssues: totalIssues
            },
            user: req.user,
            transactions: transactions
        });    
    });

    router.get('/property.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);
        var totalIssues = getTotalIssues(properties);
        var property = db.properties.getProperty(userId, req.query.id);
        if (property == null)
            res.redirect('/properties.html');

        var payments = db.payments.geyPayments(req.query.id);
        var tenants = db.tenants.getTenants(req.query.id);
        var issues = db.issues.getOpenIssuesForProperty(req.query.id);
        res.render('property', {
            status: {
              totalIssues: totalIssues
        	},
            user: req.user,
            property: property,
            payments: payments,
            tenants: tenants,
            issues: issues
        });
    });

    router.get('/tenants.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);
        var totalIssues = getTotalIssues(properties);
        res.render('tenants', {
            status: {
              totalIssues: totalIssues
        	},
            user: req.user
        });
    });

    router.get('/problem.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);
        var totalIssues = getTotalIssues(properties);

        var issue = db.issues.getIssue(userId, req.query.issueId);
        if (issue == null)
        	res.redirect('/problems.html');

        if (issue.status == 'new')
            issue.status = 'open';

        res.render('problem', {
            status: {
              totalIssues: totalIssues
        	},
            user: req.user,
            issue: issue
        });
    });

    router.get('/problems.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;

        var properties = db.properties.getAllProperties(userId);
        var totalIssues = getTotalIssues(properties);
        
        var openIssues = db.issues.getAllUnsolvedIssues(userId);
        var solvedIssues = db.issues.getAllSolvedIssues(userId);
        
        res.render('problems', {
            status: {
              totalIssues: totalIssues
        	},
            user: req.user,
            openIssues: openIssues,
            solvedIssues: solvedIssues,
        });
    });

    router.post('/login',
        passport.authenticate('local', {
            failureRedirect: '/'
        }),
        function(req, res) {
            res.redirect('/properties.html');
        });

    router.get('/logout',
        function(req, res) {
            req.logout();
            res.redirect('/');
        });

	router.get('/subscribe', function(req, res) {
		var email = req.query.email;
		emailService.addEmail(email);
		elasticMailService.sendMail({
        	to: email, 
        	subject: 'Thank you for subscribing to Azurent', 
        	body_text: 'You\'re subscribed', 
        	body_html: '<H1>Congrats! You are subscribed</H1>', 
        	from: 'admin@azurent.be', 
        	fromName: 'Azurent'
        });
        res.send('Done');
	});

    return router;
})();
