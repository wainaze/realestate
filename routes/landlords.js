var express = require('express');
var db = require('../db');
var ensureLogin = require('connect-ensure-login');
var userAccess = require('../services/userAccessService');
var router = express.Router();
var Promise = require('bluebird');
var worker = require('../common/worker.js');
var commonExceptions = require('../common/commonExceptions.js');

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

function run(func){
    return function(callback){
        if (typeof(func.success) == 'function') {
            return func.success(function(data){ callback(null, data); }).error(function(err){callback(err)});
        } else {
            return func.then(function(data){ callback(null, data); }).catch(function(err){callback(err)});
        }
    }
}

function issuesCounters(properties) {
    var propertyIds = properties.map(function(property){
        return property.id;
    });
    console.log('issueCounter');    
    return worker.series({
        issues: run(db.issues.getOpenIssuesForPropertiesCount(propertyIds)),
        newIssues: run(db.issues.getNewIssuesForPropertiesCount(propertyIds))
    });
}

// define the home page route
router.get('/properties.html', function(req, res) {
    var userId = req.user.id;
    var data = {user: req.user};

    Promise.resolve(db.properties.getAllProperties(userId))
    .then(function(properties){
        data.properties = properties;
        return issuesCounters(properties);
    })
    .then(function(results){
        data.status = {
            totalIssues: results.issues,
            totalNewIssues: results.newIssues,
            due: getTotalDue(data.properties),
            totalIncome: '39.800',
            totalCosts: '12.564'
        };   
        res.render('properties', data);
    })
    .catch(function(err){
         res.send(err);
    });  
});

router.get('/contracts.html', function(req, res) {
    var data = {};
    Promise
    .join(
        db.tenants.getAllTenants(req.user.id),
        db.issues.getNewIssuesCount(req.user.id),
        function(tenants, newIssuesCount){
            data.user = req.user;
            data.status = {totalNewIssues: newIssuesCount};
            data.tenants = tenants;
            console.log(data);
        })
    .then(function() {
        res.render('contracts', data)
    })
    .catch(function(err) {
        res.send(err);
    });
});

router.get('/paymentStatus.html', function(req, res) {
    var data = {
        user: req.user    
    }
    Promise
    .resolve(db.properties.getAllProperties(req.user.id))
    .then(function(properties){
        var propertyIds = properties.map(function(property){return property.id;});

        return Promise.resolve(db.issues.getNewIssuesForPropertiesCount(propertyIds));
    })
    .then(function(count){
        data.status = {
            totalNewIssues: count
        }
    })
    .then(function(){
        res.render('paymentStatus', data);   
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
    var data = {};
    Promise.join(
        db.properties.getProperty(req.user.id, req.query.id),
        db.payments.geyPayments(req.query.id),
        db.tenants.getTenants(req.query.id),
        db.issues.getOpenIssuesForProperty(req.query.id),
        db.issues.getNewIssuesCount(req.user.id),
        function(property, payments, tenants, issues, newIssuesCount)  {
            data.user = req.user;
            data.status = {totalNewIssues : newIssuesCount};
            data.property = property;
            data.payments = payments;
            data.tenants = tenants;
            data.issues = issues;
        })
    .then(function() {
        res.render('property', data)
    }) 
    .catch(commonExceptions.AccessNotAllowed, function(err){
        console.log('Error is here');
        res.redirect('properties.html');
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

router.get('/addProperty.html', function(req, res) {
    var userId = req.user.id;
    var properties = db.properties.getAllProperties(userId);
    var totalNewIssues = getTotalNewIssues(properties);
    res.render('addProperty', {
        status: {
            totalNewIssues: totalNewIssues
        },
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