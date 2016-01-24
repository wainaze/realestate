/**
 * Created by Sergey on 12/01/2016.
 */
var db = azurent.db; // FIXME controller should not talk to db directly
var textUtils = azurent.common.textUtils;
var moment = require('moment');

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

function processAddMessage(req, res){
    var userId = req.user.id;
    var dialogId = parseInt(req.body.dialogId);
    var messageText = req.body.messageText;
    var message = {
        userId : userId,
        timestamp : moment().format('YYYYMMDDHHmmss'),
        text : messageText
    };
    db.messages.addMessage(dialogId, message)
        .then(function(){
            res.send('ok');
        })
        .catch(function(err){
            res.send(err);
        });
}

function listMessages(req, res){
    var userId = req.user.id;
    var dialogId = parseInt(req.query.dialogId);
    console.log('dialogId');
    console.log(dialogId);
    db.messages.setDialogViewed(dialogId, userId)
    .then(function() {
        return db.messages.getDialogMessages(dialogId);
    })
    .then(function(messages){
        messages.forEach(function(message){
            message.mine = message.userId == userId;
        });
        res.send(messages);
    })
}

function processAddDialog(req, res){
    var userId = req.user.id;
    var recepients = JSON.parse(req.body.recepients);
    recepients.push(userId);
    var title = req.body.title;
    var messageText = req.body.message;
    var dialog = {
        caption : title,
        users: recepients,
        messages: []
    };
    var message = {
        userId : userId,
        timestamp : moment().format('YYYYMMDDHHmmss'),
        text : messageText
    };
    db.messages.addDialog(dialog)
        .then(function(dialogId){
            return db.messages.addMessage(dialogId, message);
        })
        .then(function(){
            res.send('ok');
        })
        .catch(function(err){
            res.send(err);
        });
}

exports.renderMessages = renderMessages;
exports.listRecipients = listRecipients;
exports.processAddMessage = processAddMessage;
exports.listMessages = listMessages;
exports.processAddDialog = processAddDialog;