function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(document).on('click', '.commentPlaceholder', function(e){
	$('.commentEditArea').show();
	$('.commentPlaceholder').hide();
	$('.commentText').focus();
})

$('.holdIssue').on('click', function(){
	holdIssue();
});

$('.reopenIssue').on('click', function(){
	reopenIssue();
});

$('.solveIssue').on('click', function(){
	solveIssue();
});

$('.rejectIssue').on('click', function(){
	rejectIssue();
});

$('#addCommentButton').on('click', function(){
	addComment($('.commentText').html());
	clearCommentEditArea();
});


$('#cancelCommentButton').on('click', function(){
	clearCommentEditArea();
});

function clearCommentEditArea() {
	$('.commentEditArea').hide();
	$('.commentText').html('');
	$('.commentPlaceholder').show();
}

function addComment(text){
	var issueId = getParameterByName('issueId');
	$.post('/addComment', {issueId: issueId, commentText : text});
	window.location.reload();
}

function holdIssue(){
	var issueId = getParameterByName('issueId');
	$.post('/holdIssue', { issueId: issueId });
	window.location.reload();
}

function reopenIssue(){
	var issueId = getParameterByName('issueId');
	$.post('/reopenIssue', { issueId: issueId });
	window.location.reload();
}

function solveIssue(){
	var issueId = getParameterByName('issueId');
	$.post('/solveIssue', { issueId: issueId });
	window.location.reload();
}

function rejectIssue(){
	var issueId = getParameterByName('issueId');
	$.post('/rejectIssue', { issueId: issueId });
	window.location.reload();
}
