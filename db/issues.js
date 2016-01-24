var properties = require('./properties');
var transactions = require('./transactions');
var moment = require('moment');
var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection').db.get('issues'));

records.aggregate = function(aggregation){
    var collection = this.col;
    var options = {};
    return new Promise(function(resolve) {
        collection.aggregate(aggregation, options, function(err, data){
            if (err) throw err;             
            resolve(data);
        });
    });
}
    
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
    return records.find({issuePropertyId : { $in : propertyIds}, status : { $in: ['new'] } }).then(sortIssues);    
}

function getAllSolvedIssuesForPropertiesIds(propertyIds) {
    return records.find({issuePropertyId : { $in : propertyIds}, status : { $nin: ['new', 'open'] } }).then(sortIssues);    
}

function getAllUnsolvedIssuesForPropertiesIds(propertyIds) {
    console.log('Getting unsolved issues');
    console.log(propertyIds);
    return records.find({issuePropertyId : { $in : propertyIds}, status : { $in: ['new', 'open'] } }).then(sortIssues);    
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
    return getAllUnsolvedIssuesForPropertiesIds([propertyId]).then(sortIssues);
}

exports.getSolvedIssuesForProperty = function(propertyId) {
    return getAllSolvedIssuesForPropertiesIds([propertyId]).then(sortIssues);
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

exports.addIssue = function(userId, subject, description, propertyId) {
    return getMaxId()
    .then(function(maxId){
        var issue = {
            id: maxId + 1, 
            issueCaption: subject, 
            issueDescription: description,
            issuePropertyId: propertyId, 
            creationDate: moment().format("DD/MM/YYYY"), 
            status: 'new', 
            costs: []
        }
        return records.insert(issue);
    });
}

exports.addCost = function(issueId, userId, costAmount, costDescription) {
    var issueId = parseInt(issueId);
    return Promise.resolve(  
    records.findOne({id : issueId})
    .then(function(issue){
        return transactions.addTransaction(userId, issue.issuePropertyId, -parseFloat(costAmount), costDescription)
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

function getMaxId() {
    return records.aggregate(
       [
          {
            $group : {
               _id : null,
               maxId: { $max: "$id" }
            }
          }
       ]
    ).get(0).get('maxId');
}

function sortIssues(issues) {
    return new Promise(function(resolve){
        issues = issues.sort(function(a,b){
            return moment(a.creationDate, 'DD/MM/YYYY').diff(moment(b.creationDate, 'DD/MM/YYYY'), 'days');
        });
        issues.reverse();
        resolve(issues);
    })
}