var moment = require('moment');
var properties = require('./properties');
var tenants = require('./tenants');
var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection').db.get('contracts'));

exports.addContract = function(contract) {
    console.log('Get add contract promise');
    console.log(contract);
    return getMaxId()
    .then(function(maxId){
        contract.id = maxId + 1;
        console.log('Trying to post contract');
        console.log(contract);
        return records.insert(contract);
    })
    .then(function(contract){      
        return contract.id;
    });
}

exports.getContracts = function(propertyId) {
    return getContractsForPropertiesIds([propertyId]);  
}

exports.getAllContracts = function(userId) {
    return properties.getAllPropertiesIds(userId)
            .then(getContractsForPropertiesIds)
            .then(bindProperties)
            .then(bindTenanants);
}

/* Internal functions */


function getContractsForPropertiesIds(propertiesIds) {
    return records.find({propertyId : { $in : propertiesIds}});  
}

function sortContracts(contracts) {
    return new Promise(function(resolve){
        tenants = tenants.sort(function(a,b){
            return moment(a.contractBegin, 'DD/MM/YYYY').diff(moment(b.contractBegin, 'DD/MM/YYYY'), 'days');
        });
        contracts.reverse();
        resolve(contracts);
    })
}

function bindProperties(contracts){
    return Promise.all(contracts.map(function(contract){
        return properties.getPropertyById(contract.propertyId).then(function(property) { contract.property = property; return contract})
    }));
}

function bindTenanants(contracts){
    return Promise.all(contracts.map(function(contract){
        return tenants.getTenantById(contract.tenantId).then(function(tenant) { contract.tenant = tenant; return contract})
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