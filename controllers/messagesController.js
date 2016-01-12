/**
 * Created by Sergey on 12/01/2016.
 */
var db = require('../db'); // FIXME controller should not talk to db directly
var textUtils = require('../common/textUtils')
function renderMessages(req, res) {
    var data = {status : {}};
    db.messages.getDialogs(req.user.id)
        .then(function(dialogs){

            data.user = req.user;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.dialogs = dialogs;
            data.messages = [];

            res.render('messages', data);
        });
}

function listRecipients(req, res) {
    var term = req.query.term;
    db.contracts.getAllContracts(req.user.id)
        .then(function(contracts){
            contracts = contracts.filter(function(contract){ return contract.tenant && contract.tenant.userId });
            var recipients = contracts.map(function(contract){ return { value : contract.tenant.userId, label : contract.tenant.tenantName }; });
            if (term) {
                recipients = textUtils.fullTextSearch(recipients, term);
            }

            res.send(recipients);
        });
}

exports.renderMessages = renderMessages;
exports.listRecipients = listRecipients;