/**
 * Created by Sergey on 14/01/2016.
 */
var db = azurent.db;

function renderMessagesList(req, res) {
    var userId = req.tenant.userId;
    db.messages.getDialogs(userId)
    .then(function(dialogs){
        res.render('tenant/messages', {
            user : req.user,
            dialogs : dialogs,
            status: { unreadMessagesCount : req.data.status.unreadMessagesCount },
            messages : []
        });
    });
}

exports.renderMessagesList = renderMessagesList;