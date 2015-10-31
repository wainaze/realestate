$(document).on('click', 'tr.issue', function(e) {
    console.log('test');
    var issueId = $(this).data('id');
    console.log('issueId: ' + issueId);
    location.href = 'problem.html?issueId=' + issueId;
});

$(document).on('click', '.btn-group', function(e){
	e.stopImmediatePropagation();
});

$('.holdIssue').on('click', function(){
	var issueId = $(this).parents('tr.issue').first().data('id');
	$.post('/api/holdIssue', { issueId: issueId });
	window.location.reload();
});

$('.reopenIssue').on('click', function(){
	var issueId = $(this).parents('tr.issue').first().data('id');
	$.post('/apireopenIssue', { issueId: issueId });
	window.location.reload();
});

$('.solveIssue').on('click', function(){
	var issueId = $(this).parents('tr.issue').first().data('id');
	$.post('/api/solveIssue', { issueId: issueId });
	window.location.reload();
});

$('.rejectIssue').on('click', function(){
	var issueId = $(this).parents('tr.issue').first().data('id');
	$.post('/api/rejectIssue', { issueId: issueId });
	window.location.reload();
});