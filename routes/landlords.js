var express = require('express');
var db = require('../db');
var ensureLogin = require('connect-ensure-login');
var userAccess = require('../services/userAccessService');
var router = express.Router();

function getTotalDue(properties) {
    var due = 0;
    properties.forEach(function(property) {
        if (property.payment < 0)
            due += property.payment;
    });

    return Math.abs(due);
}

function getTotalIssues(properties) {
    var totalIssues = 0;
    properties.forEach(function(property) {
        var issues = db.issues.getOpenIssuesForProperty(property.id);
        totalIssues += issues.length;
    });
    return totalIssues;
}

function getTotalNewIssues(properties) {
    var totalNewIssues = 0;
    properties.forEach(function(property) {
        var issues = db.issues.getOpenIssuesForProperty(property.id);
        issues = issues.filter(function(issue) {
            return issue.status == 'new';
        });
        totalNewIssues += issues.length;
    });
    return totalNewIssues;
}
// middleware specific to this router
router.use(ensureLogin.ensureLoggedIn('/'));
router.use(userAccess.userHasRole('landlord'));

router.get('/', function(req, res){
	res.redirect('properties.html');
});

// define the home page route
router.get('/properties.html', function(req, res) {
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
            totalNewIssues: totalNewIssues,
            totalIncome: '39.800',
            totalCosts: '12.564'
        },
        properties: properties
    });
});

router.get('/paymentStatus.html', function(req, res) {
    var userId = req.user.id;
    var properties = db.properties.getAllProperties(userId);
    var totalNewIssues = getTotalNewIssues(properties);

    res.render('paymentStatus', {
        status: {
            totalNewIssues: totalNewIssues
        },
        user: req.user
    });
});

router.get('/payments.html', function(req, res) {
    var userId = req.user.id;
    var properties = db.properties.getAllProperties(userId);
    var totalNewIssues = getTotalNewIssues(properties);

    var transactions = db.transactions.getAllPayments(userId);
    transactions.forEach(function(transaction) {
        var property = db.properties.getProperty(transaction.propertyId);
        transaction.property = property;
    });

    transactions = transactions.filter(function(transaction){
        return transaction.property != null;
    });

    transactions.sort(function(a, b) {
        if (a.timestamp > b.timestamp) {
            return 1;
        }
        if (a.timestamp < b.timestamp) {
            return -1;
        }
        // a must be equal to b
        return 0;
    });
    transactions.reverse();

    res.render('payments', {
        status: {
            totalNewIssues: totalNewIssues
        },
        user: req.user,
        transactions: transactions
    });
});

router.get('/property.html', function(req, res) {
    var userId = req.user.id;
    var properties = db.properties.getAllProperties(userId);
    var totalNewIssues = getTotalNewIssues(properties);
    var property = db.properties.getProperty(req.query.id);

    if (!property || property.userId != userId)
        res.redirect('properties.html');

    var payments = db.payments.geyPayments(req.query.id);
    var tenants = db.tenants.getTenants(req.query.id);
    var issues = db.issues.getOpenIssuesForProperty(req.query.id);

    res.render('property', {
        status: {
            totalNewIssues: totalNewIssues
        },
        user: req.user,
        property: property,
        payments: payments,
        tenants: tenants,
        issues: issues
    });
});

router.get('/tenants.html', function(req, res) {
    var userId = req.user.id;
    var properties = db.properties.getAllProperties(userId);
    var totalNewIssues = getTotalNewIssues(properties);
    res.render('tenants', {
        status: {
            totalNewIssues: totalNewIssues
        },
        user: req.user
    });
});

router.get('/problem.html', function(req, res) {
    try {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);
        var totalNewIssues = getTotalNewIssues(properties);

        var issue = db.issues.getIssue(userId, req.query.issueId);
        if (issue == null)
            res.redirect('problems.html');

        if (issue.status == 'new')
            issue.status = 'open';
        var costs = [];
        issue.costs.forEach(function(transactionId) {
            var transaction = db.transactions.getTransaction(userId, transactionId);
            costs.push(transaction);
        });
        res.render('problem', {
            status: {
                totalNewIssues: totalNewIssues
            },
            user: req.user,
            issue: issue,
            costs: costs
        });
    } catch (e) {
        res.send(e.message);
    }

});

router.get('/problems.html', function(req, res) {
    var userId = req.user.id;

    var properties = db.properties.getAllProperties(userId);
    var totalNewIssues = getTotalNewIssues(properties);

    var openIssues = db.issues.getAllUnsolvedIssues(userId);
    var solvedIssues = db.issues.getAllSolvedIssues(userId);

    res.render('problems', {
        status: {
            totalNewIssues: totalNewIssues
        },
        user: req.user,
        openIssues: openIssues,
        solvedIssues: solvedIssues,
    });
});

router.get('/manageProperties.html', function(req, res) {
    var userId = req.user.id;
    var properties = db.properties.getAllProperties(userId);
    var totalNewIssues = getTotalNewIssues(properties);
    res.render('manageProperties', {
        status: {
            totalNewIssues: totalNewIssues
        },
        properties: properties,
        user: req.user
    });        
});

router.get('/messages.html', function(req, res) {
    var userId = req.user.id;
    var properties = db.properties.getAllProperties(userId);
    var totalNewIssues = getTotalNewIssues(properties);
    var messages = [{messageText : 'Test message'}];
    res.render('messages', {
        status: {
            totalNewIssues: totalNewIssues
        },
        messages: messages,
        user: req.user
    });        
});

module.exports = router;