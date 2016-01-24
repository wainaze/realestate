var moment = require('moment');
var properties = require('./properties');
var tenants = require('./tenants');
var Promise = require('bluebird');
var records = Promise.promisifyAll(require('./dbconnection').db.get('contracts'));
var uuid = require('node-uuid');

function getNewId() {
  return uuid.v4();
}

exports.saveContract = Promise.method(function(contract) {
    if (!contract.id) {
        contract.id = getNewId();
        contract.documents = [];
        return records.insert(contract);
    } else {
        return records.update({ id: contract.id }, contract).then(function() { return contract; });
    }
});

exports.getContractById = function(contractId) {
    return Promise.resolve(
                records
                .findOne({id : contractId})
                .then(bindProperty)
                .then(bindTenanant)
            );  
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

exports.getContractsToPay = function(){
    return records.find({
        paymentDay: {
            $gte: moment().date(),
            $lte: moment().date() + 2
        }
    });
}

function addContractDocument(contractId, fileId, contractDocumentTitle){
    var contractDocument = {
        id : getNewId(),
        title : contractDocumentTitle,
        fileId : fileId,
        contractId : contractId
    };
    return Promise.resolve(records.update({id: contractId}, {$push: { documents: contractDocument } })).then(function(){ return contractDocument; });
}

function removeContractDocument(contractId, documentId) {
    return Promise.resolve(records.update({id: contractId}, {$pull: { documents: {id : documentId }}}));
}

function setTenant(contractId, tenantId){
    return Promise.resolve(records.update({id: contractId}, {$set: { tenantId: tenantId }}));
}

exports.addContractDocument = addContractDocument;
exports.removeContractDocument = removeContractDocument;
exports.setTenant = setTenant;

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

function bindProperty(contract){
    return properties.getPropertyById(contract.propertyId).then(function(property) { contract.property = property; return contract})
}

function bindProperties(contracts){
    return Promise.all(contracts.map(bindProperty));
}

function bindTenanant(contract){
    return tenants.getTenantById(contract.tenantId).then(function(tenant) { contract.tenant = tenant; return contract})
}

function bindTenanants(contracts){
    return Promise.all(contracts.map(bindTenanant));
}