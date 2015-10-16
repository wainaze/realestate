var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('../db');
var ensureLogin = require('connect-ensure-login');

passport.use(new Strategy(
    function(username, password, cb) {
        db.users.findByUsername(username, function(err, user) {
            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false);
            }
            if (user.password != password) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    }));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    db.users.findById(id, function(err, user) {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    });
});

module.exports = (function() {
    var express = require('express');
    var router = express.Router();

    router.get('/', function(req, res) {
        res.render('index', {
            title: 'Hey',
            message: 'Hello there!'
        });
    });

    router.get('/index.html', function(req, res) {
        res.render('index', {
            title: 'Hey',
            message: 'Hello there!'
        });
    });

    router.get('/properties.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        res.render('properties', {
            status: {
                due: 1200,
                totalIssues: 5,
                newIssues: 1,
                totalIncome: '39.800',
                totalCosts: '12.564'
            },
            properties: db.properties.getAllProperties()
        });
    });

    router.get('/payments.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        res.render('payments', {
            title: 'Hey',
            message: 'Hello there!'
        });
    });

    router.get('/property.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var property = db.properties.getProperty(req.query.id);
        var payments = db.payments.geyPayments(req.query.id);
        var tenants = db.tenants.getTenants(req.query.id);
        var issues = db.issues.getOpenIssuesForProperty(req.query.id);
        res.render('property', {
            property: property,
            payments: payments,
            tenants: tenants,
            issues: issues
        });
    });

    router.get('/tenants.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        res.render('tenants', {
            title: 'Hey',
            message: 'Hello there!'
        });
    });

    router.get('/problem.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        res.render('problem', {
            title: 'Hey',
            message: 'Hello there!'
        });
    });

    router.get('/problems.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        res.render('problems', {
            title: 'Hey',
            message: 'Hello there!'
        });
    });

    router.post('/login',
        passport.authenticate('local', {
            failureRedirect: '/'
        }),
        function(req, res) {
            res.redirect('/properties.html');
        });

    router.get('/logout',
        function(req, res) {
            req.logout();
            res.redirect('/');
        });

    return router;
})();
