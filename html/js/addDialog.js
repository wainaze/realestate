function addDialog() {
    $.post('/api/addDialog', {
        recepients: $('#recipients').val(),
        title: $('#title').val(),
        message : $('#message').val()
    }).done(function(){
        window.location = 'messages.html';
    });
}

function cancelDialog() {
	$('#addDialogBox').remove();
}

$(document).on('click', '#addDialog', addDialog);
$(document).on('click', '#cancelDialog', cancelDialog);