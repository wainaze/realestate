var moment = require('moment');
var properties = require('./properties');
var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection').db.get('tenants'));

exports.getTenants = function(propertyId) {
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

function getTenantsForPropertiesIds(propertiesIds) {
    console.log('Finding tenants for properties ' + propertiesIds);
    return records.find({propertyId : { $in : propertiesIds}})  
        .then(sortTenants)
        .then(updateTenantsAge);  
}

exports.getAllTenants = function(userId) {
    console.log('get all tenants ' + userId);

    return properties.getAllPropertiesIds(userId)
            .then(getTenantsForPropertiesIds);
}

/* Internal functions */

function sortTenants(tenants) {
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