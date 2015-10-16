// Build POST String
var querystring = require('querystring');
var https = require('https');

exports.sendMail = function(mail) {
	// Make sure to add your username and api_key below.
	var post_data = querystring.stringify({
		'username' : '0809edba-3a23-4347-aded-cfbbb71f3c8d',
		'api_key': '0809edba-3a23-4347-aded-cfbbb71f3c8d',
		'from': mail.from,
		'from_name' : mail.fromName,
		'to' : mail.to,
		'subject' : mail.subject,
		'body_html' : mail.body_html,
		'body_text' : mail.body_text
	});

	// Object of options.
	var post_options = {
		host: 'api.elasticemail.com',
		path: '/mailer/send',
		port: '443',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length
		}
	};
	var result = '';
	// Create the request object.
	var post_req = https.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			result = chunk;
		});
		res.on('error', function (e) {
			result = 'Error: ' + e.message;
		});
	});

	// Post to Elastic Email
	post_req.write(post_data);
	post_req.end();
	return result;
}
