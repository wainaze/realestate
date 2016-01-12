var express = require('express');
var router = express.Router();
var Promise = require('bluebird');

var ensureLogin = require('connect-ensure-login');
var userAccess = require('../services/userAccessService');

var db = require('../db');

var propertiesController = require('../controllers/propertiesController');
var paymentsController = require('../controllers/paymentsController');
var problemsController = require('../controllers/problemsController');
var messagesController = require('../controllers/messagesController');
var contractsController = require('../controllers/contractsController');

router.use(ensureLogin.ensureLoggedIn('/'));
router.use(userAccess.userHasRole('landlord'));

router.use(function(req, res, next) {
    Promise.join(
        db.issues.getNewIssuesCount(req.user.id),
        db.messages.getUnreadDialogsCount(req.user.id),
        function(newIssuesCount, unreadMessagesCount ) {
            req.data = {status : {} };
            req.data.status.newIssuesCount = newIssuesCount;
            req.data.status.unreadMessagesCount = unreadMessagesCount;
            next();
        }
    );
});

router.get('/', function(req, res){
	res.redirect('properties.html');
});

router.get('/manageProperties.html', propertiesController.renderManageProperties);
router.get('/properties.html',propertiesController.renderPropertiesList);
router.get('/property.html', propertiesController.renderProperty);
router.get('/addProperty.html', propertiesController.renderAddProperty);
router.get('/properties.json', propertiesController.listProperties);

router.get('/payments.html', paymentsController.renderPaymentsList);
router.get('/paymentStatus.html', paymentsController.renderPaymentStatus);

router.get('/problems.html', problemsController.renderProblems);
router.get('/problem.html',problemsController.renderProblem);
router.get('/addIssue.html', problemsController.renderAddProblem);

router.get('/messages.html', messagesController.renderMessages);
router.get('/recipients.json', messagesController.listRecipients);

router.get('/contracts.html', contractsController.renderContractsList);
router.get('/addContract.html', contractsController.renderAddContract);
router.get('/editContract.html', contractsController.renderEditContract);
router.get('/tenants.html', contractsController.renderTenantsList);

module.exports = router;
