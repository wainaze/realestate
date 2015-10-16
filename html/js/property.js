$('#tabs a').click(function(e) {
    e.preventDefault();
    $(this).tab('show');
})
$(document).on('click', 'tr.tenant', function(e) {
    var prestatieRow = $(this);
    var prestatieErrorsRow = prestatieRow.next('.detailsRow');
    prestatieErrorsRow.toggle();
});


$(document).on('click', 'tr.issue', function(e) {
    location.href = 'problem.html';
})
