/**
 * Created by Sergey on 14/01/2016.
 */

function renderDocumentsList(req, res) {
    res.render('tenant/documents', {
        user: req.user,
        status: { unreadMessagesCount : req.data.status.unreadMessagesCount },
    });
}

exports.renderDocumentsList = renderDocumentsList;