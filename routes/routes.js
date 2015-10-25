var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('../db');
var ensureLogin = require('connect-ensure-login');
var emailService = require('../services/emailService');

function getTotalDue(properties) {
    var due = 0;
    properties.forEach(function(property) {
        if (property.payment < 0)
            due += property.payment;
    });

    return Math.abs(due);
}

function getTotalIssues(properties) {
    var totalIssues = 0;
    properties.forEach(function(property) {
        var issues = db.issues.getOpenIssuesForProperty(property.id);
        totalIssues += issues.length;
    });
    return totalIssues;
}

function getTotalNewIssues(properties) {
    var totalNewIssues = 0;
    properties.forEach(function(property) {
        var issues = db.issues.getOpenIssuesForProperty(property.id);
        issues = issues.filter(function(issue) {
            return issue.status == 'new';
        });
        totalNewIssues += issues.length;
    });
    return totalNewIssues;
}

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
        res.redirect('/index.html');
    });

    router.get('/index.html', function(req, res) {
        res.render('index', {});
    });

    router.get('/properties.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);

        var totalDue = getTotalDue(properties);
        var totalIssues = getTotalIssues(properties);
        var totalNewIssues = getTotalNewIssues(properties);

        res.render('properties', {
            user: req.user,
            status: {
                due: totalDue,
                totalIssues: totalIssues,
                totalNewIssues: totalNewIssues,
                totalIncome: '39.800',
                totalCosts: '12.564'
            },
            properties: properties
        });
    });

    router.get('/paymentStatus.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);
        var totalNewIssues = getTotalNewIssues(properties);

        res.render('paymentStatus', {
            status: {
                totalNewIssues: totalNewIssues
            },
            user: req.user
        });
    });

    router.get('/payments.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);
        var totalNewIssues = getTotalNewIssues(properties);

        var transactions = db.transactions.getAllPayments(userId);
        transactions.forEach(function(transaction) {
            var property = db.properties.getProperty(userId, transaction.propertyId);
            transaction.property = property;
        });

        transactions = transactions.filter(function(transaction){
            return transaction.property != null;
        });

        transactions.sort(function(a, b) {
            if (a.timestamp > b.timestamp) {
                return 1;
            }
            if (a.timestamp < b.timestamp) {
                return -1;
            }
            // a must be equal to b
            return 0;
        });
        transactions.reverse();

        res.render('payments', {
            status: {
                totalNewIssues: totalNewIssues
            },
            user: req.user,
            transactions: transactions
        });
    });

    router.get('/property.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);
        var totalNewIssues = getTotalNewIssues(properties);
        var property = db.properties.getProperty(userId, req.query.id);
        if (property == null)
            res.redirect('/properties.html');

        var payments = db.payments.geyPayments(req.query.id);
        var tenants = db.tenants.getTenants(req.query.id);
        var issues = db.issues.getOpenIssuesForProperty(req.query.id);
        res.render('property', {
            status: {
                totalNewIssues: totalNewIssues
            },
            user: req.user,
            property: property,
            payments: payments,
            tenants: tenants,
            issues: issues
        });
    });

    router.get('/tenants.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);
        var totalNewIssues = getTotalNewIssues(properties);
        res.render('tenants', {
            status: {
                totalNewIssues: totalNewIssues
            },
            user: req.user
        });
    });

    router.get('/problem.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        try {
            var userId = req.user.id;
            var properties = db.properties.getAllProperties(userId);
            var totalNewIssues = getTotalNewIssues(properties);

            var issue = db.issues.getIssue(userId, req.query.issueId);
            if (issue == null)
                res.redirect('/problems.html');

            if (issue.status == 'new')
                issue.status = 'open';
            var costs = [];
            issue.costs.forEach(function(transactionId) {
                var transaction = db.transactions.getTransaction(userId, transactionId);
                costs.push(transaction);
            });
            res.render('problem', {
                status: {
                    totalNewIssues: totalNewIssues
                },
                user: req.user,
                issue: issue,
                costs: costs
            });
        } catch (e) {
            res.send(e.message);
        }

    });

    router.get('/problems.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;

        var properties = db.properties.getAllProperties(userId);
        var totalNewIssues = getTotalNewIssues(properties);

        var openIssues = db.issues.getAllUnsolvedIssues(userId);
        var solvedIssues = db.issues.getAllSolvedIssues(userId);

        res.render('problems', {
            status: {
                totalNewIssues: totalNewIssues
            },
            user: req.user,
            openIssues: openIssues,
            solvedIssues: solvedIssues,
        });
    });

    router.get('/manageProperties.html', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var properties = db.properties.getAllProperties(userId);
        var totalNewIssues = getTotalNewIssues(properties);
        res.render('manageProperties', {
            status: {
                totalNewIssues: totalNewIssues
            },
            properties: properties,
            user: req.user
        });        
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

    router.post('/addCost',ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var issueId = req.body.issueId;
        var costDescription = req.body.costDescription;
        var costAmount = req.body.costAmount;
        var issue = db.issues.getIssue(userId, issueId);
        var transactionId = db.transactions.addTransaction(userId, issue.issuePropertyId, costAmount, costDescription);
        if (issue.costs == null)
            issue.costs = [];
        issue.costs.push(transactionId);   
        res.send('ok');
    });

    router.post('/addComment',ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var issueId = req.body.issueId;
        var commentText = req.body.commentText;
        console.log('comment ' + commentText);
        if (commentText && commentText.length){
            var issue = db.issues.getIssue(userId, issueId);
            if (issue.comments == null)
                issue.comments = [];
            issue.comments.push(commentText);   
        }
        res.send('ok');
    });

    router.post('/solveIssue', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var issueId = req.body.issueId;
        var issue = db.issues.getIssue(userId, issueId);
        issue.status = 'solved';
        res.send('ok');
    });

    router.post('/holdIssue', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var issueId = req.body.issueId;
        var issue = db.issues.getIssue(userId, issueId);
        issue.status = 'on-hold';
        res.send('ok');
    });

    router.post('/rejectIssue', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var issueId = req.body.issueId;
        var issue = db.issues.getIssue(userId, issueId);
        issue.status = 'rejected';
        res.send('ok');
    });

    router.post('/reopenIssue', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var issueId = req.body.issueId;
        var issue = db.issues.getIssue(userId, issueId);
        issue.status = 'open';
        res.send('ok');
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
        res.send('ok');
    });

    router.get('/setLang', function(req, res){
        var lang = req.query.lang;
        res.cookie('lang',lang);
        res.send('ok');
    });

    router.post('/addProperty', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var newProperty = {
            userId: userId,
            name: req.body.name,
            address: req.body.address,
            img: 'img/house1.jpg',
            issuesTotal: 0
        }
        var propertyId = db.properties.addProperty(newProperty);
        res.redirect('/manageProperties.html');
    });

    router.post('/removeProperty', ensureLogin.ensureLoggedIn('/'), function(req, res) {
        var userId = req.user.id;
        var propertyId = req.body.propertyId;
        db.properties.removeProperty(propertyId);
        res.redirect('/manageProperties.html');
    });

    return router;
})();
