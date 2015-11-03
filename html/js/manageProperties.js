$(document).on('click', '.addPropertyPlaceholder', function(e) {
    window.location = 'addProperty.html';
});

$(document).on('click', '.viewProperty', function(){
    var propertyId = $(this).data('propertyid');
    location.href='property.html?id=' + propertyId;
});

$(document).on('click', '.removeProperty', function(){
    var propertyId = $(this).data('propertyid');
    $.post('/api/removeProperty', {
        propertyId: propertyId
    }).done(function(){
        window.location.reload();
    });
});