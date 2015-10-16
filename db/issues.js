var records = [
    { id: 1, issueCaption: 'Broken boiler', issuePropertyId: 3, creationDate: '06/09/2015', status: 'new'},
    { id: 2, issueCaption: 'Broken boiler', issuePropertyId: 3, creationDate: '05/08/2015', status: 'open'},
    { id: 3, issueCaption: 'Broken boiler', issuePropertyId: 3, creationDate: '04/08/2015', status: 'open'},
    { id: 4, issueCaption: 'Broken boiler', issuePropertyId: 3, creationDate: '04/08/2015', status: 'open'},
    { id: 5, issueCaption: 'Rats', issuePropertyId: 3, creationDate: '03/08/2015', status: 'open'},
    { id: 6, issueCaption: 'New door lock', issuePropertyId: 1, creationDate: '05/09/2015', status: 'solved'},
    { id: 7, issueCaption: 'Broken boiler', issuePropertyId: 2, creationDate: '01/09/2015', status: 'solved'},
]

exports.getAllSolvedIssues = function() {
    return records.filter(function(value){
        return value.status != 'new' && value.status != 'open';
    });
},

exports.getAllUnsolvedIssues = function(){
    return records.filter(function(value){
        return value.status == 'new' || value.status == 'open';
    });
},

exports.getOpenIssuesForProperty = function(propertyId) {
	return records.filter(function(value){
	    return value.issuePropertyId == propertyId && (value.status == 'new' || value.status == 'open');
	});
}