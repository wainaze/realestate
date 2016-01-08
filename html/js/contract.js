function removeDocumentClicked(e) {
    var url = e.target.href;
    $.ajax({
        url: url,
        type: 'DELETE',
        success: function(result) {
            $(e.target).parent().parent().remove();
        }
    });
    e.stopImmediatePropagation;
    return false;
}

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

$(document).on('click', '.removeDocument', removeDocumentClicked);

$('#property').autocomplete({
    delay: 50,
    source: 'properties.json',
    select: setProperty,
    focus: setProperty
});

Dropzone.options.myAwesomeDropzone = {
  init: function() {
    this.on("success", function(file, response) {
        $('#documents > tbody').append('<tr><td><a href="/files/' + response.fileId + '">' + response.title + '</a></td><td><a class="removeDocument" href="/api/contract/' + response.contractId + '/document/' + response.id + '"> remove</a></td></tr>');
    });
  },
  previewsContainer: false,
};