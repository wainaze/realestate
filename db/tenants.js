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
    console.log("Add tenant");
    console.log(tenant);
    return getMaxId()
    .then(function(maxId){
        tenant.id = maxId + 1;
        return records.insert(tenant);
    })
    .then(function(tenant){      
        return tenant.id;
    });
}

exports.updateTenant = function(tenant) {
    return Promise.resolve(records.update({ id: tenant.id }, tenant)).return(tenant.id);
}

exports.getTenantById = function(tenantId) {
    return records.findOne({id : tenantId});
}

exports.getTenantByUserId = function(userId) {
    return records.findOne({userId : userId});
}

function getTenantsForPropertiesIds(propertiesIds) {
    return records.find({propertyId : { $in : propertiesIds}})  
        .then(sortTenants)
        .then(updateTenantsAge);  
}

exports.getAllTenants = function(userId) {
    return properties.getAllPropertiesIds(userId)
            .then(getTenantsForPropertiesIds)
            .then(bindProperties);
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

function bindProperties(tenants){
    return Promise.all(tenants.map(function(tenant){
        return properties.getPropertyById(tenant.propertyId).then(function(property) { tenant.property = property; return tenant})
    }));
}

records.aggregate = function(aggregation){
    var collection = this.col;
    var options = {};
    return new Promise(function(resolve) {
        collection.aggregate(aggregation, options, function(err, data){
            if (err) throw err;             
            resolve(data);
        });
    });
}


function getMaxId() {
    return records.aggregate(
       [
          {
            $group : {
               _id : null,
               maxId: { $max: "$id" }
            }
          }
       ]
    ).get(0).get('maxId');
}