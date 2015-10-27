$(document).on('click', '.commentPlaceholder', function(e) {
    $('.commentEditArea').show();
    $('.commentPlaceholder').hide();
    $('.commentText').focus();
})

$('#addCommentButton').on('click', function() {
    addComment($('.commentText').html());
    $('.commentEditArea').hide();
    $('.commentText').html('');
    $('.commentPlaceholder').show();
});

$('#cancelCommentButton').on('click', function() {
    $('.commentEditArea').hide();
    $('.commentText').html('');
    $('.commentPlaceholder').show();
});

function addComment(text) {
    var issueId = getParameterByName('issueId');
    $.post('/addComment', {
        issueId: issueId,
        commentText: text
    });
    window.location.reload();
}

$(document).on('click', '.costsPlaceholder', function(e) {
    $('.costsEditArea').show();
    $('.costsPlaceholder').hide();
    $('.costsDescription').focus();
});

$('#addCostsButton').on('click', function() {
    addCost($('.costDescription').html(), $('.costAmount').html());
    $('.costsEditArea').hide();
    $('.costDescription').html('');
    $('.costAmount').html('');
    $('.costsPlaceholder').show();
});


function addCost(description, amount) {
    var issueId = getParameterByName('issueId');
    $.post('/addCost', {
        issueId: issueId,
        costDescription: description,
        costAmount: amount
    });
    window.location.reload();
}

$('#cancelCostsButton').on('click', function() {
    $('.costsEditArea').hide();
    $('.costDescription').html('');
    $('.costAmount').html('');
    $('.costsPlaceholder').show();
});

$('.holdIssue').on('click', function() {
    var issueId = getParameterByName('issueId');
    $.post('/holdIssue', {
        issueId: issueId
    });
    window.location.reload();
});

$('.reopenIssue').on('click', function() {
    var issueId = getParameterByName('issueId');
    $.post('/reopenIssue', {
        issueId: issueId
    });
    window.location.reload();
});

$('.solveIssue').on('click', function() {
    var issueId = getParameterByName('issueId');
    $.post('/solveIssue', {
        issueId: issueId
    });
    window.location.reload();
});

$('.rejectIssue').on('click', function() {
    var issueId = getParameterByName('issueId');
    $.post('/rejectIssue', {
        issueId: issueId
    });
    window.location.reload();
});
