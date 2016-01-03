var express = require('express');
var db = require('../db');
var fs = require('fs');
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
router.use(function(req, res, next) {
    req.data = {status : {} }; 
    next();      
});
router.use(function(req, res, next) {
    db.issues.getNewIssuesCount(req.user.id)
    .then(function(newIssuesCount){
        req.data.status.newIssuesCount = newIssuesCount;
        next();
    });    
});
router.use(function(req, res, next) {
    db.messages.getUnreadDialogsCount(req.user.id)
    .then(function(unreadMessagesCount){
        req.data.status.unreadMessagesCount = unreadMessagesCount;
        next();
    });    
});

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
        function(properties, openIssuesCount){
            data.user = req.user;
            data.status.totalIssues = openIssuesCount;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.status.due = getTotalDue(properties);
            data.status.totalIncome = '39.800';
            data.status.totalCosts = '12.564'; 
            data.properties = properties;
            res.render('properties', data);
        }        
    );
});

router.get('/paymentStatus.html', function(req, res) {
    var data = {status : {}};

    db.properties.getAllProperties(req.user.id)
    .then(function(properties){
        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.properties = properties;
        res.render('paymentStatus', data);
    }); 
});

router.get('/payments.html', function(req, res) {
    var data = {status : {}};
    db.transactions.getAllPayments(req.user.id)
    .then(function(transactions){
        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.transactions = transactions;
        res.render('payments', data);  
    });   
});

router.get('/property.html', function(req, res) {
    var data = {status : {}};
    var userId = parseInt(req.user.id);
    var propertyId = parseInt(req.query.id);
    Promise.join(
        db.properties.getProperty(userId, propertyId),
        db.payments.getPayments(propertyId),
        db.contracts.getContracts(propertyId),
        db.issues.getOpenIssuesForProperty(propertyId),
        db.issues.getSolvedIssuesForProperty(propertyId),
        function(property, payments, contracts, openIssues, solvedIssues)  {
            data.user = req.user;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.property = property;
            data.payments = payments;
            data.contracts = contracts;
            data.openIssues = openIssues;
            data.solvedIssues = solvedIssues;
            res.render('property', data);
        }
    );
});

router.get('/tenants.html', function(req, res) {
    var data = {status : {}};
    db.tenants.getAllTenants(req.user.id)
    .then(function(tenants){
        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.tenants = tenants;
        res.render('tenants', data);
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
            if (data.issue.status == 'new') {
                db.issues.updateIssueStatus(req.user.id, issueId, 'open');            
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

    data.user = req.user;
    data.status.totalNewIssues = req.data.status.newIssuesCount;
    data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
    res.render('addIssue',data);
});

router.get('/problems.html', function(req, res) {
    var data = {status : {}}
    Promise.join(
        db.issues.getAllUnsolvedIssues(req.user.id),
        db.issues.getAllSolvedIssues(req.user.id),
        function(unsolvedIssues, solvedIssues){
            data.user = req.user;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.openIssues = unsolvedIssues;
            data.solvedIssues = solvedIssues;
            res.render('problems', data);
        }
    );
});

router.get('/manageProperties.html', function(req, res) {
    var data = {status : {}};

    db.properties.getAllProperties(req.user.id)
    .then(function (properties){
        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.properties = properties; 
        res.render('manageProperties', data);
    });      
});

router.get('/addProperty.html', function(req, res) {
    var data = {status : {}};
    data.user = req.user;
    data.status.totalNewIssues = req.data.status.newIssuesCount;
    data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
    res.render('addProperty', data);
});

router.get('/messages.html', function(req, res) {
    var data = {status : {}};
    db.messages.getDialogs(req.user.id)
    .then(function(dialogs){

        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.dialogs = dialogs;
        data.messages = [];

        res.render('messages', data);    
    });    
});

router.get('/contracts.html', function(req, res) {
    var data = {status : {}};
    db.contracts.getAllContracts(req.user.id)
    .then(function(contracts){
        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.contracts = contracts;

        res.render('contracts', data)
    });
});

router.get('/addContract.html', function(req, res){
    var data = {status : {}, contract : {}};

    db.properties.getPropertyById(req.query.propertyId)
    .then(function (property, properties){
        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.title = 'Add contract';
        data.contract.property = property;
        data.contract.fromDate = moment().format('DD/MM/YYYY');
        data.contract.tillDate = moment().add(1, 'years').format('DD/MM/YYYY');
        data.contract.paymentDay = 15;

        res.render('contract', data);
    });           
});

router.get('/editContract.html', function(req, res){
    var data = {status : {}};
    db.contracts.getContractById(parseInt(req.query.id))
    .then(function (contract){
        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.title = 'Update contract';
        data.contract = contract; 

        res.render('contract', data);    
    });           
});


RegExp.escape= function(s) {
    s = s.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&')
    return s.replace('*', '.+');
};

function fullTextSearch(list, searchString){
    try {
        var tokens = searchString.split(' ');
        var arrFiltered = list;
        tokens.forEach(function(token){
            var regex = new RegExp('\:"(:?[^"]*)' + RegExp.escape(token) + '(:?[^"]*)"','i');
            arrFiltered =  arrFiltered.filter(function(obj) {
                return JSON.stringify(obj).match(regex);
            });       
        });
        return arrFiltered;
    } catch(e){
        console.error(e);
        return list;
    }

}

router.get('/properties.json', function(req, res) {
    var term = req.query.term;
    db.properties.getAllProperties(req.user.id)
    .then(function(properties){
        var properties = properties.map(function(property) { return {value: property.id, label: property.name}});
        if (term) {
            properties = fullTextSearch(properties, term);
        }
        res.send(properties);
    });
});

router.get('/recipients.json', function(req, res) {
    var term = req.query.term;
    db.contracts.getAllContracts(req.user.id)
    .then(function(contracts){
        contracts = contracts.filter(function(contract){ return contract.tenant && contract.tenant.userId });
        var recipients = contracts.map(function(contract){ return { value : contract.tenant.userId, label : contract.tenant.tenantName }; });
        if (term) {
            recipients = fullTextSearch(recipients, term);
        }

        res.send(recipients);
    });
});

module.exports = router;