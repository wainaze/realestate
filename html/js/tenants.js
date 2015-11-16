$(document).on('click', 'tr.tenant', function(e){
	var prestatieRow = $(this);
	var prestatieErrorsRow = prestatieRow.next('.detailsRow');
	prestatieErrorsRow.toggle();
});