var properties = require('./properties');
var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection').db.get('issues'));

exports.getAllSolvedIssues = function(userId) {
    var issues = records.filter(function(issue){
    	if (properties.getProperty(userId, issue.issuePropertyId) == null)
    		return false;
        return issue.status != 'new' && issue.status != 'open';
    });
    issues.forEach(function(issue){
    	var property = properties.getProperty(userId, issue.issuePropertyId);
    	issue.property = property;
    });
    return issues
}

exports.getAllUnsolvedIssues = function(userId){
    var issues = records.filter(function(issue){
    	if (properties.getProperty(userId, issue.issuePropertyId) == null)
    		return false;
        return issue.status == 'new' || issue.status == 'open';
    });
    issues.forEach(function(issue){
    	var property = properties.getProperty(userId, issue.issuePropertyId);
    	issue.property = property;
    });
    return issues;
}

exports.getNewIssuesCount = function(userId) {
    return Promise
    .resolve(properties.getAllProperties(userId))
    .then(function(properties){
        var propertyIds = properties.map(function(property){return property.id;});

        return Promise.resolve(exports.getNewIssuesForPropertiesCount(propertyIds));
    });
}

exports.getNewIssuesForPropertiesCount = function(propertyIds) {
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

exports.getOpenIssuesForProperty = function(propertyId, callback) {
    return records.find({issuePropertyId : propertyId, status : { $in: ['new', 'open'] } });
}

exports.getOpenIssuesForPropertiesCount = function(propertyIds, callback) {
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