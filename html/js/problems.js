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
	$.post('/holdIssue', { issueId: issueId });
	window.location.reload();
});

$('.reopenIssue').on('click', function(){
	var issueId = $(this).parents('tr.issue').first().data('id');
	$.post('/reopenIssue', { issueId: issueId });
	window.location.reload();
});

$('.solveIssue').on('click', function(){
	var issueId = $(this).parents('tr.issue').first().data('id');
	$.post('/solveIssue', { issueId: issueId });
	window.location.reload();
});

$('.rejectIssue').on('click', function(){
	var issueId = $(this).parents('tr.issue').first().data('id');
	$.post('/rejectIssue', { issueId: issueId });
	window.location.reload();
});