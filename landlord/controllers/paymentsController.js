var db = azurent.db; // FIXME controller should not talk to db directly
var contractsService = azurent.services.contractsService;

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

function listPropertyPayments(req, res){
    var propertyId = parseInt(req.query.id);
    db.payments.getLastYearPayments(propertyId)
    .then(function(payments){
        payments = payments.map(function(payment){
            return payment.payment;
        });
        res.send(payments);
    })
    .catch(function(err){
        res.send(err);
    });
}

function processMarkPaymentPayed(req, res){
    var paymentId = parseInt(req.body.id);
    var propertyId = parseInt(req.body.propertyId);
    contractsService.markPaymentPayed(propertyId, paymentId)
    .then(function(){
        res.send('ok');
    })
    .catch(function(err){
        res.send(err);
    });
}

exports.renderPaymentsList = renderPaymentsList;
exports.renderPaymentStatus = renderPaymentStatus;
exports.listPropertyPayments = listPropertyPayments;
exports.processMarkPaymentPayed = processMarkPaymentPayed;