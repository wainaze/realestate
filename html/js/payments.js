var labels = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

var data = {
    1: [
        600,
        600,
        600,
        600,
        600,
        600,
        600,
        600,
        600,
        600,
        600,
        600
    ],
    2: [
        600,
        600,
        600,
        600,
        600,
        600,
        600,
        600,
        600,
        600,
        600,
        600
    ],
    3: [
        0,
        0,
        0,
        0,
        0,
        600,
        600,
        600,
        600,
        600,
        -600,
        -600
    ]
};

function normalizeData(payments){
    while (payments.length < 12) {
        payments.unshift(0);
    }
    return payments;    
}

function getDisplayData(payments){
    payments = payments.map(function(payment){ return Math.abs(payment); });
    return payments;
}

function getIndexesToMark(payments){
    var indexes = [];
    for (var i = 0; i < payments.length; i++) {
        if (payments[i] < 0) indexes.push(i);
    }
    return indexes;
}

function renderChartBox(row, payments) {
    var payments = normalizeData(payments);
    var displayData = getDisplayData(payments);
    var indexesToMark = getIndexesToMark(payments);
    const green = "#8bc34a";
    const red = "#e84e40";
    var barChartData = {
        labels: labels,
        datasets: [{
            label: "Payments",
            fillColor: green,
            strokeColor: green,
            highlightFill: green,
            highlightStroke: green,
            data: displayData
        }]
    };

    var canvas = $(row).find('#mycanvas');
    canvas.css('width', '100%');
    canvas.css('height', '150px');
    canvas[0].height = 150;
    var ctx = canvas[0].getContext("2d");
    var myObjBar = new Chart(ctx).Bar(barChartData, {
        responsive: false
    });

    if (indexesToMark.length > 0) {
        indexesToMark.forEach(function(index){
            myObjBar.datasets[0].bars[index].fillColor = red; 
            myObjBar.datasets[0].bars[index].strokeColor = red; 
            myObjBar.datasets[0].bars[index].highlightFill = red; 
            myObjBar.datasets[0].bars[index].highlightStroke = red; 
        });
        myObjBar.update();
    }
}

$(document).on('click', 'tr.property', function(e) {
    var prestatieRow = $(this);
    var prestatieErrorsRow = prestatieRow.next('.detailsRow');
    var propertyId = prestatieRow.data('propertyid');
    $.get('/api/propertyPayments?id=' + propertyId)
    .success(function(payments){
        prestatieErrorsRow.toggle();
        renderChartBox(prestatieErrorsRow, payments);
    })
    .error(function(err){
        console.debug(err);
    });
});
