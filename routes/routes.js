var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var ensureLogin = require('connect-ensure-login');
var db = require('../db');
var emailService = require('../services/emailService');
var userAccess = require('../services/userAccessService');

passport.use(new Strategy(
    function(username, password, cb) {
        console.log('Checking user');
        db.users.findByUsername(username, function(err, user) {
            if (err) {
                console.log(err);
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
        res.redirect('/home.html');
    });

    router.get('/login.html', function(req, res) {
        res.render('login', {});
    });

    router.get('/home.html', ensureLogin.ensureLoggedIn('/login.html'), function(req, res) {
        var user = req.user; 
        if (userAccess.checkUserHasRole(user, 'landlord')) {
            res.redirect('/landlord/');
        } else if (userAccess.checkUserHasRole(user, 'tenant')) {
            res.redirect('/tenant/');
        } else {
            res.redirect('/login.html');    
        }        
    });

    router.post('/login',
        passport.authenticate('local', {
            failureRedirect: '/login.html'
        }),
        function(req, res) {
            res.redirect('/home.html');
        }
    );

    router.get('/logout',
        function(req, res) {
            req.logout();
            res.redirect('/');
        }
    );

    router.get('/subscribe', function(req, res) {
        var email = req.query.email;
        emailService.addEmail(email);
        emailService.sendMail({
            to: email,
            subject: 'Thank you for subscribing to Azurent',
            body_text: 'You\'re subscribed',
            body_html: '<H1>Congrats! You are subscribed</H1>',
            from: 'admin@azurent.be',
            fromName: 'Azurent'
        });
        res.redirect('http://www.azurent.be/index.html?subscribed=ok');
    });

    router.get('/listSubscribers.html', function(req, res) {
         // Disable caching for content files
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
        
        var subscribers = emailService.listEmails();
        res.render('listSubscribers', {
            subscribers: subscribers
        });        
    });

    router.get('/setLang', function(req, res){
        var lang = req.query.lang;
        res.cookie('lang',lang);
        res.send('ok');
    });

    return router;
})();
