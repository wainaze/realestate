var router = require('express').Router();
var ensureLogin = require('connect-ensure-login');

var db = azurent.db;

var userAccess = azurent.services.userAccessService;
var problemsController = azurent.tenant.controllers.problemsController;
var paymentsController = azurent.tenant.controllers.paymentsController;
var messagesController = azurent.tenant.controllers.messagesController;
var documentsController = azurent.tenant.controllers.documentsController;

// middleware specific to this router
router.use(ensureLogin.ensureLoggedIn('/'));
router.use(userAccess.userHasRole('tenant'));

router.use(function(req, res, next){
    var userId = parseInt(req.user.id);
    db.tenants.getTenantByUserId(userId)
    .then(function(tenant){
        if (!tenant) {
            res.redirect('/logout');
            return;
        }

        req.tenant = tenant;
        return db.properties.getPropertyById(tenant.propertyId)
    })
    .then(function(property){
        req.property = property;
        return db.messages.getUnreadDialogsCount(req.user.id)
    })
    .then(function(unreadMessagesCount){
        req.data = {status : {} };
        req.data.status.unreadMessagesCount = unreadMessagesCount;
        next();
    });
});

router.get('/', function(req, res) {
	res.redirect('payments.html');	
});

router.get('/problems.html', problemsController.renderProblems);
router.get('/problem.html', problemsController.renderProblem);
router.get('/addIssue.html', problemsController.renderAddProblem);

router.get('/payments.html', paymentsController.renderPaymentsList);

router.get('/messages.html', messagesController.renderMessagesList);

router.get('/documents.html', documentsController.renderDocumentsList);

module.exports = router;