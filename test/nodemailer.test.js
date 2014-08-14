'use strict';

var test = require('tape'),
    path = require('path'),
    mmMailer = require('..');

// ensure the NODE_ENV is set to 'test' so we don't send out an email
process.env.NODE_ENV = 'test';

test('it should return an error when sender email address is missing', function(t) {
    var mailer = new mmMailer({});
    mailer.send({mail: {to: 'test@test.com'}}, function(err) {
        t.equal(err.toString(), 'Error: Sender email address required');
        t.end();
        mailer.close();
    });
});

test('it should return an error when receiver email address is missing', function(t) {
    var mailer = new mmMailer({mail: { from: 'test@test.com'}});
    mailer.send({}, function(err) {
        t.equal(err.toString(), 'Error: Receiver email address required');
        t.end();
        mailer.close();
    });
});

test('it should send a text email', function(t) {
    var mailer = new mmMailer({
        mail: {
            from: 'test@test.com',
            to: 'test@test.com'
        }
    });
    mailer.send({}, function(err, data) {
        t.notOk(err, 'There should not be an error when sending email');
        t.equal(data, '250 2.0.0 OK 1407018531 gc8sm23308604wic.3 - gsmtp');
        t.end();
        mailer.close();
    });
});

test('it should send a template email', function(t) {
    var mailer = new mmMailer({
        mail: {
            from: 'test@test.com',
            to: 'test@test.com',
            templateName: 'newsletter',
            templateContent: {
                email: 'mamma.mia@spaghetti.com',
                name: {
                    first: 'Mamma',
                    last: 'Mia'
                }
            }
        },
        templatesDir: path.resolve(__dirname + '/../examples/templates'),
        templateEngineOptions: {
            helpers: {
                uppercase: function (context) {
                    return context.toUpperCase();
                }
            }
        }
    });

    mailer.send({}, function(err, data, html, text) {
        t.notOk(err, 'There should not be an error when sending email');
        t.equal(data, '250 2.0.0 OK 1407018531 gc8sm23308604wic.3 - gsmtp');
        t.equal(html, '<h1>Hi there Mamma MIA.</h1>'); // MIA should upper CASE to make sure handlebars helper is working
        t.equal(text, 'Hi there Mamma MIA.');
        t.end();
        mailer.close();
    });
});