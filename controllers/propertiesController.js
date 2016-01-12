var Promise = require('bluebird');
var db = require('../db'); // FIXME controller should not talk to db directly
var textUtils = require('../common/textUtils')
var financeService = require('../services/financeService');

function renderManageProperties(req, res) {
    var data = {status : {}};

    db.properties.getAllProperties(req.user.id)
        .then(function (properties){
            data.user = req.user;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.properties = properties;
            res.render('manageProperties', data);
        });
}

function renderPropertiesList(req, res) {
    var data = {status : {}};
    Promise.join(
        db.properties.getAllProperties(req.user.id),
        db.issues.getOpenIssuesCount(req.user.id),
        financeService.getIncomeOfTheYear(req.user.id),
        financeService.getCostsOfTheYear(req.user.id),
        function(properties, openIssuesCount, totalIncome, totalCosts){
            data.user = req.user;
            data.status.totalIssues = openIssuesCount;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.status.due = getTotalDue(properties);
            data.status.totalIncome = totalIncome;
            data.status.totalCosts = -totalCosts;
            data.properties = properties;
            res.render('properties', data);
        }
    );
};

function renderProperty(req, res) {
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
}

function renderAddProperty(req, res) {
    var data = {status : {}};
    data.user = req.user;
    data.status.totalNewIssues = req.data.status.newIssuesCount;
    data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
    res.render('addProperty', data);
}

function listProperties(req, res) {
    var term = req.query.term;
    db.properties.getAllProperties(req.user.id)
        .then(function(properties){
            var properties = properties.map(function(property) { return {value: property.id, label: property.name}});
            if (term) {
                properties = textUtils.fullTextSearch(properties, term);
            }
            res.send(properties);
        });
}

function getTotalDue(properties) {
    var due = 0;
    properties.forEach(function(property) {
        if (property.payment < 0)
            due += property.payment;
    });

    return Math.abs(due);
}

exports.renderManageProperties = renderManageProperties;
exports.renderPropertiesList = renderPropertiesList;
exports.renderProperty = renderProperty;
exports.renderAddProperty = renderAddProperty;
exports.listProperties = listProperties;