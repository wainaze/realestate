var currentDialog = 0;

function loadMessages(dialogId) {
	currentDialog = dialogId;
	$.get('/api/loadMessages', {dialogId : currentDialog}).success(function(data){
		console.log(data);
		$.get('/includes/messages.mst').success(function(template){
			Mustache.parse(template);   // optional, speeds up future uses
		    var rendered = Mustache.render(template, {messages : data});
		    $('.messagesData').html(rendered);
		});	    
	});
}

$('#sendButton').on('click', function() {
	var messageText = $('#messageText').val();
	$.post('/api/addMessage', 
		{
			dialogId : currentDialog,
			messageText : messageText
		}
	).success(function() {
		loadMessages(currentDialog)
	});
});

$(document).on('click', '.dialog', function(event){
	var target =  $(event.target);
	if (!target.hasClass('dialog'))
		target = target.parents('.dialog').first();
	var dialogId = target.data('id');
	loadMessages(dialogId);
})