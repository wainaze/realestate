var moment = require('moment');
var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection').db.get('tenants'));

function sortTenants(tenants) {
    console.log('sort them');
    return new Promise(function(resolve){
        console.log(tenants);
        tenants = tenants.sort(function(a,b){
            return moment(a.contractBegin, 'DD/MM/YYYY').diff(moment(b.contractBegin, 'DD/MM/YYYY'), 'days');
        });
        tenants.reverse();
        resolve(tenants);
        console.log(tenants);
    })
}

function updateTenantsAge(tenants) {
    console.log('Update age');
    return new Promise(function(resolve) {
        tenants.forEach(function(tenant){
            if (tenant.birthDate) {
                tenant.age = moment().diff(moment(tenant.birthDate, 'DD/MM/YYYY'), 'years');   
            }      
        });
        resolve(tenants);
        console.log(tenants);
    });
}

exports.getTenants = function(propertyId) {
    console.log('Get tenants ' + propertyId);
    return records.find({propertyId: parseInt(propertyId)})
    .then(sortTenants)
    .then(updateTenantsAge);
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