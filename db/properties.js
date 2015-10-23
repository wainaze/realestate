var records = [{
    id: 1,
    userId: 1,
    name: 'Rue de Rivoli',
    payment: 600,
    img: 'img/house1.jpg',
    issuesTotal: 0
}, {
    id: 2,
    userId: 1,
    name: 'Vlaanderenstraat 62',
    payment: 600,
    img: 'img/house2.jpg',
    issuesTotal: 0
}, {
    id: 3,
    userId: 1,
    name: 'Korenlei',
    payment: -1200,
    img: 'img/house3.jpg',
    issuesTotal: 5
}, {
    id: 4,
    userId: 1,
    name: 'Appartment Kortrijk',
    payment: 750,
    img: 'img/Flat1.jpg',
    issuesTotal: 0
}, {
    id: 5,
    userId: 2,
    name: 'Gent studio 1',
    payment: 800,
    img: 'img/Studio 1.jpg',
    issuesTotal: 0
}, {
    id: 6,
    userId: 2,
    name: 'Gent studio 2',
    payment: 750,
    img: 'img/Studio 2.jpg',
    issuesTotal: 0
}, ];

exports.getProperty = function(userId, propertyId) {
    for (var i = 0; i < records.length; i++) {
        if (records[i].id == propertyId && records[i].userId == userId)
            return records[i];
    }

    return null;
};

exports.getAllProperties = function(userId){
    return records.filter(function(value){
        return value.userId == userId;
    });
};

exports.addProperty = function(property){
    var newId = Math.max.apply(Math, records.map(function(o) {
        return o.id;
    })) + 1;

    property.id = newId;
    records.push(property);
	return newId;
};

exports.removeProperty = function(propertyId) {
	records = records.filter(function(property){
		return property.id != propertyId;
	});
}