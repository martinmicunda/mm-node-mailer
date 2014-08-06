'use strict';

/**
 * Module dependencies.
 */
var extend         = require('util')._extend,
    nodemailer     = require('nodemailer'),
    emailTemplates = require('email-templates');

/**
 * Configure nodemailer.
 *
 * @example
 *  ```js
 *      var mailer = mmMailer({
 *          config: {
 *              service: 'Gmail',
 *              auth: {
 *                  user: 'test@gmail.com',
 *                  pass: 'password'
 *              }
 *          },
 *          mail: {
 *              from: 'test@gmail.com',
 *              subject: 'Hello',
 *              text: 'Hello world ✔',
 *              html: '<b>Hello world ✔</b>'
 *          }
 *      });
 *      var mailOptions = {
 *          to: 'your.email@address.com',
 *      }
 *      mailer.send(mailOptions, function (err, data) {
 *          if (err) return console.error(err);
 *          console.log('An e-mail has been sent successfully. Server responded with "' + data + '"');
 *      });
 *  ```
 *
 * @param {Object} options - the nodemailer and email configuration data
 * @returns {{send: send, close: close}} - send email and close connection pull functions
 */
module.exports = function (options) {
    /**
     * Extend base values:
     *  - config              - the nodemailer configuration. See {@link https://github.com/andris9/nodemailer-smtp-transport `nodemailer-smtp-transport`} for full description of config fields.
     *  - mail                - the to, from, cc, etc, fields for all emails. See {@link https://github.com/andris9/Nodemailer#e-mail-message-fields `e-mail-message-fields`} for full description of email fields.
     *      - templateName    - (optional) the template folder name that is store in templates directory
     *      - templateContent - (optional) the template JSON content
     *  - templatesDir        - (optional) the templates directory path
     */
    options = extend({
        config: {},
        mail: {
            templateName: '',
            templateContent: {}
        },
        templatesDir: ''
    }, options);

    // create transporter that is able to send mail
    var transporter = nodemailer.createTransport(options.config);

    return {
        /**
         * Sends an email using the preselected transport object.
         *
         * @param {Object} mailOptions - the email data options, see {@link https://github.com/andris9/Nodemailer#e-mail-message-fields `e-mail-message-fields`} for full description of email fields.
         * @param {function} cb - the callback that handles the return success or failure
         */
        send: function (mailOptions, cb) {
            // extend the default mail options with options passed by user
            options.mail = extend(options.mail, mailOptions);

            if(!options.mail.from) {
                return cb(new Error('Sender email address required'));
            }
            if(!options.mail.to) {
                return cb(new Error('Receiver email address required'));
            }

            if(options.templatesDir && options.mail.templateName) {
                emailTemplates(options.templatesDir, function (err, template) {
                    if (err) return cb(err);

                    template(options.mail.templateName, options.mail.templateContent, function (err, html, text) {
                        if (err) return cb(err);

                        options.mail.html = html;
                        options.mail.text = text;

                        // if we are testing don't send out an email instead return
                        // success, info response, html and txt strings for inspection
                        if (process.env.NODE_ENV === 'test') {
                            return cb(null, '250 2.0.0 OK 1407018531 gc8sm23308604wic.3 - gsmtp', html, text);
                        }

                        transporter.sendMail(options.mail, function (err, info) {
                            if (err) return cb(err);

                            return cb(null, info.response, html, text);
                        });
                    });
                });
            } else {
                // if we are testing don't send out an email instead return
                // success and info response for inspection
                if (process.env.NODE_ENV === 'test') {
                    return cb(null, '250 2.0.0 OK 1407018531 gc8sm23308604wic.3 - gsmtp');
                }
                transporter.sendMail(options.mail, function (err, info) {
                    if (err) return cb(err);

                    return cb(null, info.response);
                });
            }
        },
        /**
         * Optional close method that shut down the connection pool so no more messages are send (use if you don't
         * want to use this transport object anymore).
         */
        close: function() {
            transporter.close();
        }
    };
};