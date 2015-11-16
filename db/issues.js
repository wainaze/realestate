var properties = require('./properties');
var transactions = require('./transactions');
var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection').db.get('issues'));
    
function setProperty(issue) {
    return function(property) {
        issue.property = property;
        return issue;
    };
}

function bindProperty(issue) {
    return properties.getPropertyById(issue.issuePropertyId)
            .then(setProperty(issue));
}

function bindAllProperties(issues) {
    return Promise.all(issues.map(function(issue){
        return bindProperty(issue);
    }));
}

function fillTranactions(issue){
    if (!issue.costs) issue.costs = [];
    return Promise.all(issue.costs.map(function(transactionId){
        return transactions.getTransaction(transactionId)
    })).then(function(transactions) {
        issue.costs = transactions;
        return issue;
    });
}

function getCount(data) {
    return new Promise(function(resolve){
        resolve(data.length);
    });
}

function getAllNewIssuesForPropertiesIds(propertyIds) {
    return records.find({issuePropertyId : { $in : propertyIds}, status : { $in: ['new'] } });    
}

function getAllSolvedIssuesForPropertiesIds(propertyIds) {
    return records.find({issuePropertyId : { $in : propertyIds}, status : { $nin: ['new', 'open'] } });    
}

function getAllUnsolvedIssuesForPropertiesIds(propertyIds) {
    return records.find({issuePropertyId : { $in : propertyIds}, status : { $in: ['new', 'open'] } });    
}

exports.getAllNewIssues = function(userId) {
    return properties.getAllPropertiesIds(userId)
            .then(getAllNewIssuesForPropertiesIds)
            .then(bindAllProperties);
}

exports.getAllSolvedIssues = function(userId) {
    return properties.getAllPropertiesIds(userId)
            .then(getAllSolvedIssuesForPropertiesIds)
            .then(bindAllProperties);
}

exports.getAllUnsolvedIssues = function(userId){
    return properties.getAllPropertiesIds(userId)
            .then(getAllUnsolvedIssuesForPropertiesIds)
            .then(bindAllProperties);
}

function getNewIssuesForPropertiesCount(propertyIds){
    return new Promise(
        function(resolve) {
            records.find({ issuePropertyId : { $in : propertyIds} , status : 'new' })
            .success(function(issues){
                resolve(issues.length);
            })
            .error(function(err){
                throw err;
            });
        }        
    );
}

exports.getNewIssuesCount = function(userId) {
    return properties.getAllPropertiesIds(userId)
        .then(getAllNewIssuesForPropertiesIds)
        .then(getCount);
}

exports.getOpenIssuesCount = function(userId) {
    return properties.getAllPropertiesIds(userId)
        .then(getAllUnsolvedIssuesForPropertiesIds)
        .then(getCount);    
}

exports.getNewIssuesForPropertiesCount = function(propertyIds) {
    return getNewIssuesForPropertiesCount(propertyIds)
}

exports.getOpenIssuesForProperty = function(propertyId) {
    return records.find({issuePropertyId : parseInt(propertyId), status : { $in: ['new', 'open'] } });
}

exports.getOpenIssuesForPropertiesCount = function(propertyIds) {
    return new Promise(
        function(resolve) {
            records.find({issuePropertyId : { $in : propertyIds} , status : { $in: ['new', 'open'] } })
            .success(function(issues){
                resolve(issues.length);
            })
            .error(function(err){
                throw err;
            })
        }
    );  
}

exports.getIssue = function(issueId){
    return records.findOne({id : parseInt(issueId)})
            .then(bindProperty)
            .then(fillTranactions);
}

exports.addCost = function(issueId, userId, costAmount, costDescription) {
    var issueId = parseInt(issueId);
    return Promise.resolve(  
    records.findOne({id : issueId})
    .then(function(issue){
        return transactions.addTransaction(parseInt(userId), issue.issuePropertyId, parseFloat(costAmount), costDescription)
    })
    .then(function(transactionId){
        return records.update(
                { id: issueId },
                { $push: { costs: transactionId } });
    }));
}

exports.addComment = function(userId, issueId, commentText) {
    var issueId = parseInt(issueId);
    return Promise.resolve(records.update({ id: issueId }, { $push: { comments: commentText } }));
}

exports.updateIssueStatus = function(userId, issueId, status) {
    var issueId = parseInt(issueId);
    return Promise.resolve(records.update({ id: issueId }, { $set: { status: status }}));
}