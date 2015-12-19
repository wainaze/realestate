var express = require('express');
var db = require('../db');
var ensureLogin = require('connect-ensure-login');
var userAccess = require('../services/userAccessService');
var router = express.Router();
var Promise = require('bluebird');
var commonExceptions = require('../common/commonExceptions.js');
var moment = require('moment');

function getTotalDue(properties) {
    var due = 0;
    properties.forEach(function(property) {
        if (property.payment < 0)
            due += property.payment;
    });

    return Math.abs(due);
}

// middleware specific to this router
router.use(ensureLogin.ensureLoggedIn('/'));
router.use(userAccess.userHasRole('landlord'));

router.get('/', function(req, res){
	res.redirect('properties.html');
});

// define the home page route
router.get('/properties.html', function(req, res) {
    var data = {status : {}};
    Promise
    .join(
        db.properties.getAllProperties(req.user.id),
        db.issues.getOpenIssuesCount(req.user.id),
        db.issues.getNewIssuesCount(req.user.id),
        function(properties, openIssuesCount, newIssuesCount){
            data.user = req.user;
            data.status.totalIssues = openIssuesCount;
            data.status.totalNewIssues = newIssuesCount;
            data.status.due = getTotalDue(properties);
            data.status.totalIncome = '39.800';
            data.status.totalCosts = '12.564'; 
            data.properties = properties;
        }        
    )
    .then(function(){
        res.render('properties', data);
    });
});

router.get('/paymentStatus.html', function(req, res) {
    var data = {status : {}};
    Promise
    .join(
        db.properties.getAllProperties(req.user.id),
        db.issues.getNewIssuesCount(req.user.id),
        function(properties, newIssuesCount){
            data.user = req.user;
            data.status.totalNewIssues = newIssuesCount;
            data.properties = properties;
        }
    )
    .then(function(){
        res.render('paymentStatus', data);
    }); 
});

router.get('/payments.html', function(req, res) {
    var data = {};
    Promise
    .join(
        db.transactions.getAllPayments(req.user.id),
        db.issues.getNewIssuesCount(req.user.id),
        function(transactions, newIssuesCount){
            data.user = req.user;
            data.status = {totalNewIssues: newIssuesCount};
            data.transactions = transactions;
    })
    .then(function(){
        res.render('payments', data);   
    });   
});

router.get('/property.html', function(req, res) {
    var data = {};
    var userId = parseInt(req.user.id);
    var propertyId = parseInt(req.query.id);
    Promise.join(
        db.properties.getProperty(userId, propertyId),
        db.payments.geyPayments(propertyId),
        db.contracts.getContracts(propertyId),
        db.issues.getOpenIssuesForProperty(propertyId),
        db.issues.getSolvedIssuesForProperty(propertyId),
        db.issues.getNewIssuesCount(propertyId),
        function(property, payments, contracts, openIssues, solvedIssues, newIssuesCount)  {
            data.user = req.user;
            data.status = {totalNewIssues : newIssuesCount};
            data.property = property;
            data.payments = payments;
            data.contracts = contracts;
            data.openIssues = openIssues;
            data.solvedIssues = solvedIssues;
        })
    .then(function() {
        res.render('property', data)
    });
});

router.get('/tenants.html', function(req, res) {
    var data = {};
    Promise
    .join(
        db.tenants.getAllTenants(req.user.id),
        db.issues.getNewIssuesCount(req.user.id),
        function(tenants, newIssuesCount){
            data.user = req.user;
            data.status = {totalNewIssues: newIssuesCount};
            data.tenants = tenants;
        })
    .then(function() {
        res.render('tenants', data)
    });
});

router.get('/problem.html', function(req, res) {
    var data = { status : {}};
    var issueId = parseInt(req.query.issueId);
    if (issueId <= 0 || isNaN(issueId)) {
        res.redirect('problems.html');   
        return;    
    }
    Promise
    .join(
        db.issues.getIssue(issueId),
        db.issues.getNewIssuesCount(req.user.id),  
        function(issue, newIssuesCount){ 
            data.user = req.user;
            data.status.totalNewIssues = newIssuesCount;
            data.issue = issue;
            data.costs = issue.costs;
        }    
    )
    .then(function(){
        if (data.issue) {
            if (data.issue.status == 'new') {
                db.issues.updateIssueStatus(req.user.id, req.query.issueId, 'open');            
                data.issue.status = 'open';
            }
            res.render('problem', data);
        } else {
            res.redirect('problems.html');
        }
    });
});

router.get('/addIssue.html', function(req, res) {
    var userId = parseInt(req.user.id);
    var data = {status : {}};
    Promise
    .join(
        db.properties.getAllProperties(userId),
        db.issues.getNewIssuesCount(req.user.id),  
        function(properties, newIssuesCount){
            var properties = properties.map(function(property) { return {data: property.id, value: property.name}});
            data.user = req.user;
            data.status.totalNewIssues = newIssuesCount;
            data.properties = properties;
        }
    )
    .then(function(){
        res.render('addIssue',data);
    })
});

router.get('/problems.html', function(req, res) {
    var data = {}
    Promise.join(
        db.issues.getAllUnsolvedIssues(req.user.id),
        db.issues.getAllSolvedIssues(req.user.id),
        db.issues.getNewIssuesCount(req.user.id),
        function(unsolvedIssues, solvedIssues, newIssuesCount){
            data.user = req.user;
            data.status = {totalNewIssues: newIssuesCount};
            data.openIssues = unsolvedIssues;
            data.solvedIssues = solvedIssues;
        }
    )
    .then(function() {
        res.render('problems', data)
    });
});

router.get('/manageProperties.html', function(req, res) {
    var data = {status : {}};
    Promise
    .join(
        db.properties.getAllProperties(req.user.id),
        db.issues.getNewIssuesCount(req.user.id),
        function (properties, newIssuesCount){
            data.user = req.user;
            data.status = {totalNewIssues: newIssuesCount};
            data.properties = properties; 
        }
    )
    .then(function(){
        res.render('manageProperties', data);   
    });      
});

router.get('/addProperty.html', function(req, res) {
    var data = {status : {}};
    Promise
    .join(
        db.issues.getNewIssuesCount(req.user.id),
        function (newIssuesCount){
            data.user = req.user;
            data.status = {totalNewIssues: newIssuesCount};
        }
    )
    .then(function(){
        res.render('addProperty', data);   
    });     
});

router.get('/messages.html', function(req, res) {
    var data = {};
    if (req.query.id != null) {
        var dialogId = parseInt(req.query.id);
        Promise
        .join(
            db.messages.getDialogs(req.user.id),
            db.messages.getDialogMessages(dialogId),
            db.issues.getNewIssuesCount(req.user.id),
            function(dialogs, messages, newIssuesCount){
                data.user = req.user;
                data.status = {totalNewIssues: newIssuesCount};
                data.dialogs = dialogs;
                data.messages = messages;
            }        
        )
        .then(function(){
            res.render('messages', data);
        });        
    } else {
        db.messages.getDialogs(req.user.id).
        then(function(dialogs){
            if (dialogs.length) {
                Promise
                .join(
                    db.messages.getDialogMessages(dialogs[0].id),
                    db.issues.getNewIssuesCount(req.user.id),
                    function(messages, newIssuesCount){
                        data.user = req.user;
                        data.status = {totalNewIssues: newIssuesCount};
                        data.dialogs = dialogs;
                        data.messages = messages;
                    }        
                )
                .then(function(){
                    res.render('messages', data);
                })  
            } else {
                Promise
                .join(
                    db.issues.getNewIssuesCount(req.user.id),
                    function(newIssuesCount){
                        data.user = req.user;
                        data.status = {totalNewIssues: newIssuesCount};
                        data.dialogs = dialogs;
                        data.messages = [];
                    }        
                )
                .then(function(){
                    res.render('messages', data);
                })
            }
        })
    }
    
});

router.get('/contracts.html', function(req, res) {
    var data = {};
    Promise
    .join(
        db.contracts.getAllContracts(req.user.id),
        db.issues.getNewIssuesCount(req.user.id),
        function(contracts, newIssuesCount){
            data.user = req.user;
            data.status = {totalNewIssues: newIssuesCount};
            data.contracts = contracts;
        })
    .then(function() {
        res.render('contracts', data)
    });
});

router.get('/addContract.html', function(req, res){
    var data = {status : {}, contract : {}};
    Promise
    .join(
        db.properties.getPropertyById(req.query.propertyId),
        db.properties.getAllProperties(req.user.id),
        db.issues.getNewIssuesCount(req.user.id),
        function (property, properties, newIssuesCount){
            var properties = properties.map(function(property) { return {data: property.id, value: property.name}});
            data.user = req.user;
            data.status = {totalNewIssues: newIssuesCount};
            data.title = 'Add contract';
            data.properties = properties;
            data.contract.property = property;
            data.contract.fromDate = moment().format('DD/MM/YYYY');
            data.contract.tillDate = moment().add(1, 'years').format('DD/MM/YYYY');
            data.contract.paymentDay = 15;
        }
    )
    .then(function(){
        res.render('contract', data);   
    });           
});

router.get('/editContract.html', function(req, res){
    var data = {status : {}};
    Promise
    .join(
        db.contracts.getContractById(parseInt(req.query.id)),
        db.properties.getAllProperties(req.user.id),
        db.issues.getNewIssuesCount(req.user.id),
        function (contract, properties, newIssuesCount){
            var properties = properties.map(function(property) { return {data: property.id, value: property.name}});
            data.user = req.user;
            data.status = {totalNewIssues: newIssuesCount};
            data.title = 'Update contract';
            data.properties = properties;
            data.contract = contract;  
        }
    )
    .then(function(){
        res.render('contract', data);   
    });           
});



module.exports = router;