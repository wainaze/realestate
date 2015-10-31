$(document).on('click', '.addPropertyPlaceholder', function(e) {
    $('.addPropertyEditArea').show();
    $('.addPropertyPlaceholder').hide();
    $('#propertyName').focus();
});

$('#addPropertyButton').on('click', function() {
    addProperty();
    $('.addPropertyEditArea').hide();
    $('.addPropertyPlaceholder').show();
});

$('#cancelAddPropertyButton').on('click', function() {
    $('.addPropertyEditArea').hide();
    $('.addPropertyPlaceholder').show();
});

function addProperty() {
    $.post('/api/addProperty', {
        name: $('#propertyName').val(),
        address: $('#propertyAddress').val()
    }).done(function(){
        window.location.reload();
    });
};
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