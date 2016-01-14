/**
 * Created by Sergey on 14/01/2016.
 */

var db = azurent.db;

function renderPaymentsList(req, res) {
    var property = req.property;
    db.payments.getPayments(property.id)
    .then(function(payments){
        res.render('tenant/payments', {
            user: req.user,
            status: { unreadMessagesCount : req.data.status.unreadMessagesCount },
            payments: payments,
        });
    });
}

exports.renderPaymentsList = renderPaymentsList;