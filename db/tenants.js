var records = [{
    propertyId: 1,
    name: 'Adam Jacque',
    contractBegin: '06/05/2014',
    contractEnd: '-',
    picture: 'img/samples/noface.jpg',
    age: 36,
    phone: '+32 483 657638'
}, {
    propertyId: 1,
    name: 'Marie Claude',
    contractBegin: '01/01/2014',
    contractEnd: '01/05/2014',
    picture: 'img/samples/noface.jpg',
    age: 36,
    phone: '+32 457 155345'
}, {
    propertyId: 1,
    name: 'Luis Filip Hugo',
    contractBegin: '01/07/2013',
    contractEnd: '27/12/2013',
    picture: 'img/samples/noface.jpg',
    age: 36,
    phone: '+32 482 123452'
}, ]

exports.getTenants = function(propertyId) {
    return records.filter(function(value) {
        return value.propertyId == propertyId;
    });
}
