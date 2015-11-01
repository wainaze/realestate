function loadMessages() {
	$.get('/api/loadMessages').success(function(data){
		$.get('/includes/messages.mst').success(function(template){
			Mustache.parse(template);   // optional, speeds up future uses
		    var rendered = Mustache.render(template, {messages : data});
		    $('#messages').html(rendered);
			console.log(data);	
		});	    
	});
}

$('#sendButton').on('click', function() {
	var messageText = $('#messageText').val();
	$.post('/api/addMessage', 
		{
			messageText : messageText
		}
	).success(loadMessages);
});