#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');

var properties = [
                {id: 1, name: 'Rue de Rivoli', payment: 600, img: 'img/house1.jpg', issuesTotal : 0},
                {id: 2, name: 'Vlaanderenstraat 62', payment: 600, img: 'img/house2.jpg', issuesTotal : 0},
                {id: 3, name: 'Korenlei', payment: -1200, img: 'img/house3.jpg', issuesTotal : 5},
                {id: 4, name: 'Appartment Kortrijk', payment: 750, img: 'img/Flat1.jpg', issuesTotal : 0},
                {id: 5, name: 'Gent studio 1', payment: 800, img: 'img/Studio 1.jpg', issuesTotal : 0},
                {id: 6, name: 'Gent studio 2', payment: 750, img: 'img/Studio 2.jpg', issuesTotal : 0},
            ];

var payments = [
    {propertyId: 1, month: 'October', monthId: 10, dueDate: '7/10/2015', payedDate: '7/10/2015', payment: 600 },
    {propertyId: 1, month: 'September', monthId: 9, dueDate: '7/09/2015', payedDate: '7/09/2015', payment: 600 },
    {propertyId: 1, month: 'August', monthId: 8, dueDate: '7/08/2015', payedDate: '7/08/2015', payment: 600 },
    {propertyId: 1, month: 'July', monthId: 7, dueDate: '7/07/2015', payedDate: '7/07/2015', payment: 600 },
    {propertyId: 1, month: 'June', monthId: 6, dueDate: '7/06/2015', payedDate: '7/06/2015', payment: 600 },
    {propertyId: 1, month: 'May', monthId: 5, dueDate: '7/05/2015', payedDate: '7/05/2015', payment: 600 },
    {propertyId: 1, month: 'April', monthId: 4, dueDate: '7/04/2015', payedDate: '7/04/2015', payment: 600 },
    {propertyId: 1, month: 'March', monthId: 3, dueDate: '7/03/2015', payedDate: '7/03/2015', payment: 600 },
    {propertyId: 1, month: 'February', monthId: 2, dueDate: '7/02/2015', payedDate: '7/02/2015', payment: 600 },
    {propertyId: 1, month: 'January', monthId: 1, dueDate: '7/01/2015', payedDate: '7/01/2015', payment: 600 },
    {propertyId: 1, month: 'December', monthId: 0, dueDate: '7/12/2015', payedDate: '7/12/2015', payment: 600 },
    {propertyId: 1, month: 'November', monthId: -1, dueDate: '7/11/2015', payedDate: '7/11/2015', payment: 600 }
];

var tenants = [
    { propertyId: 1, name: 'Adam Jacque', contractBegin: '06/05/2014', contractEnd: '-', picture: 'img/samples/noface.jpg', age: 36, phone: '+32 483 657638' },
    { propertyId: 1, name: 'Marie Claude', contractBegin: '01/01/2014', contractEnd: '01/05/2014', picture: 'img/samples/noface.jpg', age: 36, phone: '+32 457 155345' },
    { propertyId: 1, name: 'Luis Filip Hugo', contractBegin: '01/07/2013', contractEnd: '27/12/2013', picture: 'img/samples/noface.jpg', age: 36, phone: '+32 482 123452' },
]

var issues = [
    { id: 1, issueCaption: 'Broken boiler', issuePropertyId: 3, creationDate: '06/09/2015', status: 'new'},
    { id: 2, issueCaption: 'Broken boiler', issuePropertyId: 3, creationDate: '05/08/2015', status: 'open'},
    { id: 3, issueCaption: 'Broken boiler', issuePropertyId: 3, creationDate: '04/08/2015', status: 'open'},
    { id: 4, issueCaption: 'Broken boiler', issuePropertyId: 3, creationDate: '04/08/2015', status: 'open'},
    { id: 5, issueCaption: 'Rats', issuePropertyId: 3, creationDate: '03/08/2015', status: 'open'},
    { id: 6, issueCaption: 'New door lock', issuePropertyId: 1, creationDate: '05/09/2015', status: 'solved'},
    { id: 7, issueCaption: 'Broken boiler', issuePropertyId: 2, creationDate: '01/09/2015', status: 'solved'},
]

var propertiesController = {
    getProperty: function(propertyId){
        for(var i = 0; i < properties.length; i++){
            if (properties[i].id == propertyId)
             return properties[i];
        } 

        return null;
    }
}

var paymentsController = {
    geyPayments: function(propertyId){
        return payments.filter(function(value){
            return value.propertyId == propertyId;
        });
    }
}

var tenantsController = {
    getTenants: function(propertyId){
        return tenants.filter(function(value){
            return value.propertyId == propertyId;
        });
    }
}

var issueController = {
    getAllSolvedIssues: function() {
        return issues.filter(function(value){
            return value.status != 'new' && value.status != 'open';
        });
    },

    getAllUnsolvedIssues: function(){
        return issues.filter(function(value){
            return value.status == 'new' || value.status == 'open';
        });
    },

    getOpenIssuesForProperty: function(propertyId) {
        return issues.filter(function(value){
            return value.issuePropertyId == propertyId && (value.status == 'new' || value.status == 'open');
        });
    }
}

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
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
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

        self.propertiesController = propertiesController;
        self.paymentsController = paymentsController;
        self.tenantsController = tenantsController;
        self.issueController = issueController;

        self.app = express();

    	self.app.set('views', './views');	
        self.app.set('view engine', 'jade');

    	self.app.use(express.static('./html'));

    	self.app.get('/', function (req, res) {
    	  res.render('index', { title: 'Hey', message: 'Hello there!'});
    	});

        self.app.get('/index.html', function (req, res) {
          res.render('index', { title: 'Hey', message: 'Hello there!'});
        }); 	

        self.app.get('/properties.html', function (req, res) {
          res.render('properties', { 
            status: {
                due: 1200,
                totalIssues: 5,
                newIssues: 1,
                totalIncome: '39.800',
                totalCosts: '12.564'
            },
            properties: properties
          });
        }); 

        self.app.get('/payments.html', function (req, res) {
          res.render('payments', { title: 'Hey', message: 'Hello there!'});
        }); 

        self.app.get('/property.html', function (req, res) {
          var property = server.propertiesController.getProperty(req.query.id);
          var payments = server.paymentsController.geyPayments(req.query.id);
          var tenants = server.tenantsController.getTenants(req.query.id);
          var issues = server.issueController.getOpenIssuesForProperty(req.query.id);
          res.render('property', { property: property, payments: payments, tenants: tenants, issues: issues });
        });

        self.app.get('/tenants.html', function (req, res) {
          res.render('tenants', { title: 'Hey', message: 'Hello there!'});
        });

        self.app.get('/problem.html', function (req, res) {
          res.render('problem', { title: 'Hey', message: 'Hello there!'});
        });

        self.app.get('/problems.html', function (req, res) {
          res.render('problems', { title: 'Hey', message: 'Hello there!'});
        });
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

