var properties = require('./properties');
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

function getAllSolvedIssuesForPropertiesIds(propertyIds) {
    return records.find({issuePropertyId : { $in : propertyIds}, status : { $nin: ['new', 'open'] } });    
}

function getAllUnsolvedIssuesForPropertiesIds(propertyIds) {
    return records.find({issuePropertyId : { $in : propertyIds}, status : { $in: ['new', 'open'] } });    
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
    console.log('Getting issues for ' + JSON.stringify(propertyIds));
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
    console.log('Getting issues count ' + userId);
    return properties.getAllPropertiesIds(userId)
        .then(getNewIssuesForPropertiesCount);
}

exports.getNewIssuesForPropertiesCount = function(propertyIds) {
    return getNewIssuesForPropertiesCount(propertyIds)
}

exports.getOpenIssuesForProperty = function(propertyId) {
    return records.find({issuePropertyId : propertyId, status : { $in: ['new', 'open'] } });
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

exports.getIssue = function(userId, issueId){
	for(var issueIndex = 0; issueIndex < records.length; issueIndex++){
		var issue = records[issueIndex];
		if (issue.id == issueId)
			return issue;
	}
	return null;
}