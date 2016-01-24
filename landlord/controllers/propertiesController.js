var Promise = require('bluebird');
var db = azurent.db; // FIXME controller should not talk to db directly
var textUtils = azurent.common.textUtils;
var financeService = azurent.services.financeService;
var propertiesService = azurent.services.propertiesService;
var filesService = azurent.services.filesService;

function renderManageProperties(req, res) {
    var data = {status : {}};

    db.properties.getAllProperties(req.user.id)
        .then(function (properties){
            data.user = req.user;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.properties = properties;
            res.render('manageProperties', data);
        });
}

function renderPropertiesList(req, res) {
    var data = {status : {}};
    Promise.join(
        db.properties.getAllProperties(req.user.id),
        db.issues.getOpenIssuesCount(req.user.id),
        financeService.getIncomeOfTheYear(req.user.id),
        financeService.getCostsOfTheYear(req.user.id),
        function(properties, openIssuesCount, totalIncome, totalCosts){
            fixPayments(properties);

            data.user = req.user;
            data.status.totalIssues = openIssuesCount;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.status.due = getTotalDue(properties);
            data.status.totalIncome = totalIncome;
            data.status.totalCosts = -totalCosts;
            data.properties = properties;
            res.render('properties', data);
        }
    );
}

function fixPayments(properties) {
    properties.forEach(function(property){ if (!property.payment) property.payment = 0});
}

function renderProperty(req, res) {
    var data = {status : {}};
    var userId = parseInt(req.user.id);
    var propertyId =  req.query.id.length < 5 ? parseInt(req.query.id) : req.query.id;
    Promise.join(
        db.properties.getProperty(userId, propertyId),
        db.payments.getPayments(propertyId),
        db.contracts.getContracts(propertyId),
        db.issues.getOpenIssuesForProperty(propertyId),
        db.issues.getSolvedIssuesForProperty(propertyId),
        function(property, payments, contracts, openIssues, solvedIssues)  {
            data.user = req.user;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.property = property;
            data.payments = payments;
            data.contracts = contracts;
            data.openIssues = openIssues;
            data.solvedIssues = solvedIssues;
            res.render('property', data);
        }
    );
}

function renderAddProperty(req, res) {
    var data = {status : {}};
    data.user = req.user;
    data.status.totalNewIssues = req.data.status.newIssuesCount;
    data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
    res.render('addProperty', data);
}

function listProperties(req, res) {
    var term = req.query.term;
    db.properties.getAllProperties(req.user.id)
        .then(function(foundProperties){
            var properties = foundProperties.map(function(property) { return {value: property.id, label: property.name}});
            if (term) {
                properties = textUtils.fullTextSearch(properties, term);
            }
            res.send(properties);
        });
}

function getTotalDue(properties) {
    var due = 0;
    properties.forEach(function(property) {
        if (property.payment < 0)
            due += property.payment;
    });

    return Math.abs(due);
}

function processAddProperty(req, res) {
    var userId = parseInt(req.user.id);
    var newProperty = {
        userId: userId,
        name: req.body.name,
        address: req.body.address,
        img: '/img/house1.jpg',
        issuesTotal: 0,
        payment: 0
    };
    db.properties.addProperty(newProperty)
        .then(function(){
            res.send('ok');
        })
        .error(function(err){
            res.send(err);
        });
}

function processRemoveProperty(req, res) {
    var propertyId =  req.body.id.length < 5 ? parseInt(req.body.id) : req.body.id;
    // FIXME should remove all of the related data
    db.properties.removeProperty(propertyId)
    .then(function(){
        res.send('ok');
    })
    .error(function(err){
        res.send(err);
    });
}

function processAddPhoto(req, res) {
    var file = req.files.file;
    var propertyId =  req.params.propertyId.length < 5 ? parseInt(req.params.propertyId) : req.params.propertyId;
    storeFile(file)
        .then(addPropertyPhoto(propertyId))
        .then(sendPhoto(res));
}

function processRemovePhoto(req, res) {
    var propertyId =  req.params.propertyId.length < 5 ? parseInt(req.params.propertyId) : req.params.propertyId;
    var photoId = req.params.photoId;
    // FIXME remove file from DB
    removePropertyPhoto(propertyId, photoId)
        .then(sendOk(res));
}

function storeFile(file){
    return filesService.storeFile({
        filelocation : file.path,
        filename : file.originalFilename,
        contentType: file.type,
        size: file.size
    });
}

function sendPhoto(res) {
    return function(photo) {
        res.send(photo);
    }
}

function addPropertyPhoto(propertyId) {
    return function(fileId) {
        return propertiesService.addPropertyPhoto(propertyId, fileId);
    };
}

function removePropertyPhoto(propertyId, photoId){
    return propertiesService.removePropertyPhoto(propertyId, photoId);
}

function sendOk(res) {
    return function() {
        res.sendStatus(200);
    }
}

exports.renderManageProperties = renderManageProperties;
exports.renderPropertiesList = renderPropertiesList;
exports.renderProperty = renderProperty;
exports.renderAddProperty = renderAddProperty;
exports.listProperties = listProperties;
exports.processAddProperty = processAddProperty;
exports.processRemoveProperty = processRemoveProperty;
exports.processAddPhoto = processAddPhoto;
exports.processRemovePhoto = processRemovePhoto;