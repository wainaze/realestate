var labels = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

function renderChartBad(row) {
    var barChartData = {
        labels: labels,
        datasets: [{
            label: "My First dataset",
            fillColor: "#8bc34a",
            strokeColor: "#8bc34a",
            highlightFill: "#8bc34a",
            highlightStroke: "#8bc34a",
            data: [
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
                600,
                600
            ]
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
    
    //nuevos colores
    myObjBar.datasets[0].bars[10].fillColor = "#e84e40"; //bar 1
    myObjBar.datasets[0].bars[10].strokeColor = "#e84e40"; //bar 1
    myObjBar.datasets[0].bars[10].highlightFill = "#e84e40"; //bar 1
    myObjBar.datasets[0].bars[10].highlightStroke = "#e84e40"; //bar 1
    myObjBar.datasets[0].bars[11].fillColor = "#e84e40"; //bar 1
    myObjBar.datasets[0].bars[11].strokeColor = "#e84e40"; //bar 1
    myObjBar.datasets[0].bars[11].highlightFill = "#e84e40"; //bar 1
    myObjBar.datasets[0].bars[11].highlightStroke = "#e84e40"; //bar 1
    myObjBar.update();
};

function renderChartGood(row) {
    var barChartData = {
        labels: labels,
        datasets: [{
            label: "My First dataset",
            fillColor: "#8bc34a",
            strokeColor: "#8bc34a",
            highlightFill: "#8bc34a",
            highlightStroke: "#8bc34a",
            data: [
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
            ]
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
};
$(document).on('click', 'tr.property', function(e) {
    var prestatieRow = $(this);
    var prestatieErrorsRow = prestatieRow.next('.detailsRow');
    prestatieErrorsRow.toggle();
    if (prestatieRow.hasClass('bad')) {
        renderChartBad(prestatieErrorsRow);
    } else {
        renderChartGood(prestatieErrorsRow);
    }
});
