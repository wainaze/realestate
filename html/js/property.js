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
});

$(document).on('shown.bs.tab','a[data-toggle="tab"]', function (e) {
	var url = $(this)[0].href;
	var hash = url.substring(url.indexOf('#')+1);
	location.hash = hash;
});

var tabToOpen = location.hash;
if (tabToOpen) {
	$('.nav-tabs a[href="'+tabToOpen+'"]').tab('show');	
}

