function addDialog() {
    $.post('/api/addDialog', {
        recepients: '[' +$('#recipients').val() + ']',
        title: $('#title').val(),
        message : $('#message').val()
    }).done(function(){
        window.location = 'messages.html';
    });
}

function cancelDialog() {
	$('#addDialogBox').remove();
}

$('#recipients').tokenfield({
  autocomplete: {
    source: 'recipients.json',
    //source:  ['red','blue','green','yellow','violet','brown','purple','black','white'],
    delay: 100
  },
  showAutocompleteOnFocus: true
});

$(document).on('click', '#addDialog', addDialog);
$(document).on('click', '#cancelDialog', cancelDialog);