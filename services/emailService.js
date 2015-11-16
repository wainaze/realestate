var fs = require('fs');
var db = require('../db');

// Build POST String
var querystring = require('querystring');
var https = require('https');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport({
    host: 'n1plcpnl0039.prod.ams1.secureserver.net',
    secure: true,
    port: 465,
    auth: {
        user: 'info@azurent.be',
        pass: 'Ziopizzapronto2008'
    }
}));

exports.addEmail = function(email) {
    return db.subscribers.addEmail(email);
}

exports.sendMail = function(mail) {
	var mailOptions = {
	    from: mail.fromName + '<' + mail.from + '>',
	    to: mail.to, 
	    subject: mail.subject, 
	    text: mail.body_text, 
	    html: mail.body_html 
	};
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
	});
}

exports.listEmails = function() {
    return db.subscribers.getAllSubscribers();
 }
