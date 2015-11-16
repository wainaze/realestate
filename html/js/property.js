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
	var issueId = $(this).data('id');
    location.href = 'problem.html?issueId='+ issueId;
});

$(document).on('shown.bs.tab','a[data-toggle="tab"]', function (e) {
	var url = $(this)[0].href;
	var hash = url.substring(url.indexOf('#')+1);
	location.hash = hash;
});

function addTenant(){
	$('#addTenantDialog').show();
}

function closeTenantDialog(){
	$('#addTenantDialog').hide();	
}

function saveTenant(){
	propertyId = getParameterByName('id');
	$.post(
		'/api/saveTenant', 
		{
			propertyId : propertyId,
			tenantName : $('#tenantName').val(),
			since : $('#fromDate').val(),
			till : $('#tillDate').val(),
			phoneNumber : $('#phonenumber').val(),
			birthDate : $('#birthDate').val()
		},
		function(){
			closeTenantDialog();
			location.reload();	
		}
	);
}

$(document).on('click', '#addTenant', addTenant);
$(document).on('click', '#addTenantDialogClose', closeTenantDialog);
$(document).on('click', '#addTenantDialogSave', saveTenant);

$('#fromDate, #tillDate, #birthDate').mask('99/99/9999'); 

var tabToOpen = location.hash;
if (tabToOpen) {
	$('.nav-tabs a[href="'+tabToOpen+'"]').tab('show');	
}

