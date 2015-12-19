var express = require('express');
var db = require('../db');
var ensureLogin = require('connect-ensure-login');
var router = express.Router();

// middleware specific to this router
router.use(ensureLogin.ensureLoggedIn('/'));

router.get('/addDialog.mst', function(req, res) {
    res.render('includes/addDialog', {});
});

module.exports = router;