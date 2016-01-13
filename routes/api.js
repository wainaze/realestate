var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty')();
var ensureLogin = require('connect-ensure-login');

var paymentsController = azurent.landlord.controllers.paymentsController;
var problemsController = azurent.landlord.controllers.problemsController;
var propertiesController = azurent.landlord.controllers.propertiesController;
var contractsController = azurent.landlord.controllers.contractsController;
var messagesController = azurent.landlord.controllers.messagesController;

router.use(ensureLogin.ensureLoggedIn('/'));

router.post('/addCost', problemsController.processAddCost);
router.post('/addComment', problemsController.processAddComment);
router.post('/addIssue', problemsController.processAddProblem);
router.post('/solveIssue', problemsController.processIssueSolved);
router.post('/holdIssue', problemsController.processIssueOnHold);
router.post('/rejectIssue', problemsController.processIssueRejected);
router.post('/reopenIssue',problemsController.processIssueReopend);

router.post('/addProperty', propertiesController.processAddProperty);
router.post('/removeProperty', propertiesController.processRemoveProperty);
router.post('/property/:propertId/photo', multipart, propertiesController.processAddPhoto);
router.delete('/property/:propertId/photo/:photoId', propertiesController.processRemovePhoto);

router.post('/saveContract', contractsController.processSaveContract);
router.post('/contract/:contractId/document', multipart, contractsController.processAddDocument);
router.delete('/contract/:contractId/document/:documentId', contractsController.processRemoveDocument);
router.post('/saveTenant', contractsController.processSaveTenant);

router.get('/loadMessages', messagesController.listMessages);
router.post('/addMessage', messagesController.processAddMessage);
router.post('/addDialog', messagesController.processAddDialog);

router.get('/propertyPayments', paymentsController.listPropertyPayments);
router.post('/paymentPayed', paymentsController.processMarkPaymentPayed);

module.exports = router;
