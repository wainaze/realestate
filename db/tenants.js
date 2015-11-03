var moment = require('moment');

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
    phone: '+32 457 155345',
    userId: 3
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
    var tenants = records.filter(function(value) {
        return value.propertyId == propertyId;
    });
    tenants = tenants.sort(function(a,b){
        return moment(a.contractBegin, 'DD/MM/YYYY').diff(moment(b.contractBegin, 'DD/MM/YYYY'), 'days');
    });
    tenants.reverse();
    tenants.forEach(function(tenant){
        if (tenant.birthDate) {
            tenant.age = moment().diff(moment(tenant.birthDate, 'DD/MM/YYYY'), 'years');   
        }
    });
    return tenants;
}

exports.addTenant = function(tenant) {
    records.push(tenant);
}

exports.getTenantByUserId = function(userId) {
    for (var i = 0; i < records.length; i++) {
        if (records[i].userId == userId)
            return records[i];
    }

    return null;
}

exports.getAllTenants = function(userId) {
    return records;    
}