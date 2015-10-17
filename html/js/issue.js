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