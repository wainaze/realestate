$('#addTenantDialogSave').on('click', function() {
    $.post('/api/saveContract', {
        contractId: getParameterByName('id'),    
    	propertyId: $('#propertyId').val(),
    	contractCaption: $('#contractCaption').val(),
    	fromDate: $('#fromDate').val(),
    	tillDate: $('#tillDate').val(),
    	paymentFrequency: $('#paymentFrequency').val(),
    	payment: $('#payment').val(),
    	paymentDay: $('#paymentDay').val(),
    	tenantName: $('#tenantName').val(),
    	birthDate: $('#birthDate').val(),
    	phonenumber: $('#phonenumber').val(),
    	email: $('#email').val(),
    })
    .done(function(){
    	location.href = document.referrer + '#contracts';
    });
});

$('#addTenantDialogClose').on('click', function() {
	location.href = document.referrer + '#contracts';
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