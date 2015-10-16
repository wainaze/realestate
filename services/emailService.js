var fs = require('fs');

exports.addEmail = function(email) {
    var emails = JSON.parse(fs.readFileSync('emails.json', 'utf8'));
    if (emails.indexOf(email) < 0) {
        emails.push(email);
        fs.writeFile('emails.json', JSON.stringify(emails), function(err) {
            if (err) throw err;
            console.log('It\'s saved!');
        });
    }
}
