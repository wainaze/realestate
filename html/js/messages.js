var currentDialog = 0;

function loadMessages(dialogId) {
	currentDialog = dialogId;
	$.get('/api/loadMessages', {dialogId : currentDialog}).success(function(data){
		console.log(data);
		$.get('/includes/messages.mst').success(function(template){
			Mustache.parse(template);   // optional, speeds up future uses
		    var rendered = Mustache.render(template, {messages : data});
		    $('.messagesData').html(rendered);
		    $('.messagesData')[0].scrollTop = $('.messagesData')[0].scrollHeight;
		});	    
	});
}

function selectDialog(event){
	var target =  $(event.target);
	if (!target.hasClass('dialog'))
		target = target.parents('.dialog').first();
	var dialogId = target.data('id');
	loadMessages(dialogId);
}

function addMessage(){
	var messageText = $('#messageText').val();
	$.post('/api/addMessage', 
		{
			dialogId : currentDialog,
			messageText : messageText
		}
	).success(function() {
		$('#messageText').val('');
		loadMessages(currentDialog);
	});
}

function showAddDialogScreen() {
	$.get('/includes/addDialog.mst').success(function(template){
		Mustache.parse(template);   // optional, speeds up future uses
	    var rendered = Mustache.render(template, {});
	    $('body').append(rendered);
	});	   		
}

function submitOnEnter(e) {
	if (e.keyCode == 13) {
		e.stopImmediatePropagation();
		addMessage();
		return false;
	}
}

$(document).on('click', '#addDialogButton', showAddDialogScreen);
$(document).on('click', '.dialog', selectDialog);
$(document).on('click', '#sendButton', addMessage);
$(document).on('keydown', '#messageText', submitOnEnter);

