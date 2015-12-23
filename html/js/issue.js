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
    $.post('/api/addComment', {
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
    $.post('/api/addCost', {
        issueId: issueId,
        costDescription: description,
        costAmount: amount
    }).success(function(data){
        window.location.reload();
    });
}

$('#cancelCostsButton').on('click', function() {
    $('.costsEditArea').hide();
    $('.costDescription').html('');
    $('.costAmount').html('');
    $('.costsPlaceholder').show();
});

$('.holdIssue').on('click', function() {
    var issueId = getParameterByName('issueId');
    $.post('/api/holdIssue', {
        issueId: issueId
    });
    window.location.reload();
});

$('.reopenIssue').on('click', function() {
    var issueId = getParameterByName('issueId');
    $.post('/api/reopenIssue', {
        issueId: issueId
    });
    window.location.reload();
});

$('.solveIssue').on('click', function() {
    var issueId = getParameterByName('issueId');
    $.post('/api/solveIssue', {
        issueId: issueId
    });
    window.location.reload();
});

$('.rejectIssue').on('click', function() {
    var issueId = getParameterByName('issueId');
    $.post('/api/rejectIssue', {
        issueId: issueId
    });
    window.location.reload();
});

function setProperty( event, ui ){
        $('#property').val(ui.item.label);
        $('input[name="property"]').val(ui.item.value);
        event.preventDefault();   
}

$('#property').autocomplete({
    delay: 50,
    source: 'properties.json',
    select: setProperty,
    focus: setProperty
});

$('#addIssueButton').on('click', function() {
    $.post('/api/addIssue', {
        issueSubject: $('#issueSubject').val(),
        issueDescription: $('#issueDescription').html(),
        issueProperty: $('input[name="property"]').val()
    }).done(function(issueId){
        window.location = 'problem.html?issueId='+issueId;
    });
});

$('#cancelAddIssueButton').on('click', function() {
    window.location = '/home.html';
});