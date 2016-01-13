/**
 * Created by Sergey on 12/01/2016.
 */
var db = azurent.db; // FIXME controller should not talk to db directly
var textUtils = azurent.common.textUtils;
var filesService = azurent.services.filesService;
var contractsService = azurent.services.contractsService;

function renderContractsList(req, res) {
    var data = {status : {}};
    db.contracts.getAllContracts(req.user.id)
    .then(function(contracts){
        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.contracts = contracts;

        res.render('contracts', data)
    });
}

function renderAddContract(req, res){
    var data = {status : {}, contract : {}};
    db.properties.getPropertyById(req.query.propertyId)
    .then(function (property){
        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.title = 'Add contract';
        data.contract.property = property;
        data.contract.fromDate = moment().format('DD/MM/YYYY');
        data.contract.tillDate = moment().add(1, 'years').format('DD/MM/YYYY');
        data.contract.paymentDay = 15;

        res.render('contract', data);
    });
}

function renderEditContract(req, res){
    var data = {status : {}};
    db.contracts.getContractById(parseInt(req.query.id))
    .then(function (contract){
        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.title = 'Update contract';
        data.contract = contract;

        res.render('contract', data);
    });
}

function renderTenantsList(req, res) {
    var data = {status : {}};
    db.tenants.getAllTenants(req.user.id)
    .then(function(tenants){
        data.user = req.user;
        data.status.totalNewIssues = req.data.status.newIssuesCount;
        data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
        data.tenants = tenants;
        res.render('tenants', data);
    });
}

function processSaveContract(req, res) {
    var userId = parseInt(req.user.id);
    var contractId = (req.body.contractId == '' ? null : parseInt(req.body.contractId));

    if (contractId) {
        db.contracts.getContractById(contractId)
        .then(function(contract){
            if (contract.tenant && !req.body.tenantName) {
                // FIXME remove tenant
                return null;
            }  else if (contract.tenant && req.body.tenantName) {
                return updateTenant(req, contract.tenant);
            } else {
                return addTenant(req);
            }
        })
        .then(function(tenantId){
            return db.contracts.updateContract({
                id: contractId,
                propertyId: parseInt(req.body.propertyId),
                contractCaption: req.body.contractCaption,
                fromDate: req.body.fromDate,
                tillDate: req.body.tillDate,
                paymentFrequency: req.body.paymentFrequency,
                payment: req.body.payment,
                paymentDay: parseInt(req.body.paymentDay),
                tenantId: tenantId
            })
        })
        .then(function(){
            res.send('ok');
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
    } else {
        var propertyId = parseInt(req.body.propertyId);
        Promise.if(req.body.tenantName != null, addTenant(req))
        .then(function(tenantId){
            return db.contracts.addContract({
                propertyId: parseInt(req.body.propertyId),
                contractCaption: req.body.contractCaption,
                fromDate: req.body.fromDate,
                tillDate: req.body.tillDate,
                paymentFrequency: req.body.paymentFrequency,
                payment: req.body.payment,
                paymentDay: parseInt(req.body.paymentDay),
                tenantId: tenantId
            })
        })
        .then(function(){
            res.send('ok');
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
    }
}

function storeFile(file){
    return filesService.storeFile({
        filelocation : file.path,
        filename : file.originalFilename,
        contentType: file.type,
        size: file.size
    });
}

function processAddDocument(req, res){
    var file = req.files.file;
    var contractId = parseInt(req.params.contractId);
    storeFile(file)
    .then(addContractDocument(contractId, file))
    .then(sendDocument(res));
}

function sendDocument(res) {
    return function(document) {
        res.send(document);
    }
}

function addContractDocument(contractId, file) {
    return function(fileId) {
        return contractsService.addContractDocument(contractId, fileId, file.originalFilename);
    };
}

function addTenant(req) {
    return db.tenants.addTenant({
        landlordId: req.user.id,
        tenantName: req.body.tenantName,
        birthDate: req.body.birthDate,
        phonenumber: req.body.phonenumber,
        email: req.body.email,
    });
}

function updateTenant(req, tenant) {
    return db.tenants.updateTenant({
        id: tenant.id,
        landlordId: req.user.id,
        tenantName: req.body.tenantName,
        birthDate: req.body.birthDate,
        phonenumber: req.body.phonenumber,
        email: req.body.email,
    });
}

function removeContractDocument(contractId, documentId){
    return contractsService.removeContractDocument(contractId, documentId);
}

function sendOk(res) {
    return function() {
        res.sendStatus(200);
    }
}

function processRemoveDocument(req, res){
    var contractId = parseInt(req.params.contractId);
    var documentId = req.params.documentId;
    // FIXME remove file from DB
    removeContractDocument(contractId, documentId)
    .then(sendOk(res));
}

function processSaveTenant(req, res) {
    var userId = parseInt(req.user.id);
    var propertyId = parseInt(req.body.propertyId);
    db.tenants.addTenant({
        propertyId: propertyId,
        name: req.body.tenantName,
        contractBegin: req.body.since,
        contractEnd: req.body.till,
        picture: '/img/samples/noface.jpg',
        birthDate: req.body.birthDate,
        phone: req.body.phoneNumber
    })
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
}

exports.renderContractsList = renderContractsList;
exports.renderAddContract = renderAddContract;
exports.renderEditContract = renderEditContract;
exports.renderTenantsList = renderTenantsList;
exports.processSaveContract = processSaveContract;
exports.processAddDocument = processAddDocument;
exports.processRemoveDocument = processRemoveDocument;
exports.processSaveTenant = processSaveTenant;