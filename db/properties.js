var records = [{
    id: 1,
    name: 'Rue de Rivoli',
    payment: 600,
    img: 'img/house1.jpg',
    issuesTotal: 0
}, {
    id: 2,
    name: 'Vlaanderenstraat 62',
    payment: 600,
    img: 'img/house2.jpg',
    issuesTotal: 0
}, {
    id: 3,
    name: 'Korenlei',
    payment: -1200,
    img: 'img/house3.jpg',
    issuesTotal: 5
}, {
    id: 4,
    name: 'Appartment Kortrijk',
    payment: 750,
    img: 'img/Flat1.jpg',
    issuesTotal: 0
}, {
    id: 5,
    name: 'Gent studio 1',
    payment: 800,
    img: 'img/Studio 1.jpg',
    issuesTotal: 0
}, {
    id: 6,
    name: 'Gent studio 2',
    payment: 750,
    img: 'img/Studio 2.jpg',
    issuesTotal: 0
}, ];

exports.getProperty = function(propertyId) {
    for (var i = 0; i < records.length; i++) {
        if (records[i].id == propertyId)
            return records[i];
    }

    return null;
};

exports.getAllProperties = function(){
    return records;
}