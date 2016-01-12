/**
 * Created by Sergey on 12/01/2016.
 */
var db = require('../db'); // FIXME controller should not talk to db directly
var textUtils = require('../common/textUtils');

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

exports.renderContractsList = renderContractsList;
exports.renderAddContract = renderAddContract;
exports.renderEditContract = renderEditContract;
exports.renderTenantsList = renderTenantsList;