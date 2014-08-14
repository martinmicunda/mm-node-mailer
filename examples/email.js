var mmMailer = require('..');

if (!process.env.EMAIL) {
    console.error('Provide email address where the email should be send by running follow command "EMAIL=your_email_address node email"');
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
        from: 'MM Team <do-not-reply@gmail.com>', // sender address
        subject: 'Hello', // Subject line
        text: 'Hello world ✔', // plaintext body
        html: '<b>Hello world ✔</b>' // html body
    }
});

// add additional mail information that will extend 'mailer.mail' data
var mailOptions = {
    to: process.env.EMAIL
};

var callback = function (err, data) {
    if (err) return console.error(err);
    console.log('An e-mail has been sent to ' + mailOptions.to + ' successfully. Server responded with "' + data + '"');
};

// send email
mailer.send(mailOptions, callback);