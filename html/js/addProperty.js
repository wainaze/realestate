$('#addPropertyButton').on('click', function() {
    $.post('/api/addProperty', {
        name: $('#propertyName').val(),
        address: $('#propertyAddress').val()
    }).done(function(){
        window.location = '/home.html';
    });
});

$('#cancelAddPropertyButton').on('click', function() {
    window.location = '/home.html';
});