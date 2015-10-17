var properties = require('./properties');

var records = [
    { id: 1, issueCaption: 'Broken boiler', issuePropertyId: 3, creationDate: '06/09/2015', status: 'new', costs: []},
    { id: 2, issueCaption: 'Broken door', issuePropertyId: 3, creationDate: '05/08/2015', status: 'open', costs: []},
    { id: 3, issueCaption: 'Roof leak', issuePropertyId: 3, creationDate: '04/08/2015', status: 'open', costs: []},
    { id: 4, issueCaption: 'Water in the cellar', issuePropertyId: 3, creationDate: '04/08/2015', status: 'open', costs: []},
    { id: 5, issueCaption: 'Rats', issuePropertyId: 3, creationDate: '03/08/2015', status: 'open', costs: []},
    { id: 6, issueCaption: 'New door lock', issuePropertyId: 1, creationDate: '05/09/2015', status: 'solved', costs: [18], comments: ['Some comment', 'Some other here']},
    { id: 7, issueCaption: 'Broken boiler', issuePropertyId: 2, creationDate: '01/09/2015', status: 'solved', costs: []},
]

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

exports.getOpenIssuesForProperty = function(propertyId) {
	return records.filter(function(value){
	    return value.issuePropertyId == propertyId && (value.status == 'new' || value.status == 'open');
	});
}

exports.getIssue = function(userId, issueId){
	for(var issueIndex = 0; issueIndex < records.length; issueIndex++){
		var issue = records[issueIndex];
		if (issue.id == issueId)
			return issue;
	}
	return null;
}