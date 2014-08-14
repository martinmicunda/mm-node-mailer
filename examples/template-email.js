var path = require("path"),
    mmMailer = require('..');

if (!process.env.EMAIL) {
    console.error('Provide email address where the email should be send by running follow command "EMAIL=your_email_address node template-email"');
    process.exit(1);
}

// create and configure mailer
var mailer = new mmMailer({
    config: {
        service: 'Gmail',
        auth: {
            user: 'mmtest030@gmail.com',
            pass: 'U#[5&<3l(6'
        }
    },
    mail: {
        from: 'do-not-reply@gmail.com', // sender address
        subject: 'MM newsletter' // Subject line
    },
    templatesDir: path.resolve(__dirname + '/templates'),
    templateEngineOptions: {
        helpers: {
            uppercase: function (context) {
                return context.toUpperCase();
            }
        }
    }
});

// add additional mail information that will extend 'mailer.mail' data
var mailOptions = {
    to: process.env.EMAIL,
    templateName: 'newsletter',
    templateContent: {
        email: 'mamma.mia@spaghetti.com',
        name: {
            first: 'Mamma',
            last: 'Mia'
        }
    }
};

var callback = function (err, data) {
    if (err) return console.error(err);
    console.log('An e-mail has been sent to ' + mailOptions.to + ' successfully. Server responded with "' + data + '"');
};

// send email
mailer.send(mailOptions, callback);