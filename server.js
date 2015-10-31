#!/bin/env node
 //  OpenShift sample Node application
var express = require('express');
var fs = require('fs');
var passport = require('passport');
var router = require('./routes/routes');

// load modules
var i18n = require('i18n-2');

/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) {
        return self.zcache[key];
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function() {
        //  Process on exit and signals.
        process.on('exit', function() {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() {
                self.terminator(element);
            });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        var server = self;

        self.app = express();

        self.app.set('views', './views');
        self.app.set('view engine', 'jade');

        self.app.use(express.static('./html'));

        self.app.use(require('morgan')('combined'));
        self.app.use(require('cookie-parser')());
        
        self.app.use(require('body-parser').urlencoded({
            extended: true
        }));

        self.app.use(require('express-session')({
            secret: 'somestrangedataazurent',
            resave: false,
            saveUninitialized: false
        }));

        self.app.use(passport.initialize());
        self.app.use(passport.session());

        // Attach the i18n property to the express request object
        // And attach helper methods for use in templates
        i18n.expressBind(self.app, {
            // setup some locales - other locales default to en silently
            locales: ['en', 'nl', 'fr'],
            // change the cookie name from 'lang' to 'locale'
        });

        self.app.use(function(req, res, next) {
            req.i18n.setLocaleFromCookie();
            res.locals.locale = req.i18n.getLocale(); 
            next();
        });

        self.app.use('/', router);
        self.app.use('/landlord', require('./routes/landlords.js'));
        self.app.use('/tenant', require('./routes/tenants.js'));
    };

    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };

    self.start = function() {
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, self.port);
        });
    };

}; 

var zapp = new SampleApp();
zapp.initialize();
zapp.start();
