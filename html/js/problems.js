$(document).on('click', 'tr.issue', function(e) {
    console.log('test');
    var issueId = $(this).data('id');
    console.log('issueId: ' + issueId);
    location.href = 'problem.html?issueId=' + issueId;
});

$(document).on('click', '.btn-group', function(e){
	e.stopImmediatePropagation();
});