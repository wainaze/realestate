var db = require('../db'); // FIXME controller should not talk to db directly

function renderPaymentsList(req, res) {
    var data = {status : {}};
    db.transactions.getAllPayments(req.user.id)
        .then(function(transactions){
            data.user = req.user;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.transactions = transactions;
            res.render('payments', data);
        });
}

function renderPaymentStatus(req, res) {
    var data = {status : {}};

    db.properties.getAllProperties(req.user.id)
        .then(function(properties){
            data.user = req.user;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.properties = properties;
            res.render('paymentStatus', data);
        });
}

exports.renderPaymentsList = renderPaymentsList;
exports.renderPaymentStatus = renderPaymentStatus;