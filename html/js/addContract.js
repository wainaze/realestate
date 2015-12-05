$('#addTenantDialogSave').on('click', function() {
    $.post('/api/addContract', {

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

$('#property').autocomplete({
    lookup: propertiesLookup,
    onSelect: function (suggestion) {
        $('#propertyId').val(suggestion.data);
    }
});