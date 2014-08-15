/**
 * The MIT License
 *
 * Copyright (c) 2014 Martin Micunda
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Module dependencies.
 */
var extend         = require('util')._extend,
    nodemailer     = require('nodemailer'),
    emailTemplates = require('email-templates');

/**
 * A node module for sending e-mails.
 *
 * @module mm-node-mailer
 * @example
 *  ```js
 *      var mailer = new mmMailer({
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
 *              text: 'Hello world!',
 *              html: '<b>Hello world!</b>'
 *          }
 *      });
 *      var mailOptions = {
 *          to: 'your.email@address.com',
 *      }
 *      mailer.send(mailOptions, function (err, respond) {
 *          if (err) return console.error(err);
 *          console.log('An e-mail has been sent successfully. Server responded with "' + respond + '"');
 *      });
 *  ```
 */
module.exports = Mailer;

/**
 * Define default mailer options.
 *
 * @type {Object} defaultOptions - the default mailer options
 * @type {Object} defaultOptions.config - the nodemailer configuration. See {@link https://github.com/andris9/nodemailer-smtp-transport `nodemailer-smtp-transport`} for full description of config fields.
 * @type {Object} defaultOptions.mail - the to, from, cc, etc, fields for all emails. See {@link https://github.com/andris9/Nodemailer#e-mail-message-fields `e-mail-message-fields`} for full description of email fields.
 * @type {string} defaultOptions.mail.templateName - (optional) the template folder name that is store in templates directory
 * @type {Object} defaultOptions.mail.templateContent - (optional) the template JSON content
 * @type {string} defaultOptions.templatesDir - (optional) the templates directory path
 * @type {Object} defaultOptions.templateEngineOptions - (optional) the template engine options e.g. helpers, partials etc. See {@link https://github.com/niftylettuce/node-email-templates#templating-language-options-eg-ejs-custom-tags `node-email-templates`} for options.
 * @private
 */
var defaultOptions = {
    config: {},
    mail: {
        templateName: '',
        templateContent: {}
    },
    templatesDir: '',
    templateEngineOptions: {}
};

/**
 * A `Mailer` constructor.
 *
 * @class Mailer
 * @constructor
 *
 * @param {Object} options - custom mailer configuration options
 */
function Mailer(options) {
    if (!(this instanceof Mailer)) {return new Mailer(options);}
    // extend default options
    this.options = extend(defaultOptions, options);
    // create transporter that is able to send mail
    this.transporter = nodemailer.createTransport(options.config);
}

/**
 * Sends an email using the preselected transport object.
 *
 * @method send
 * @param {Object}   mailOptions - the email data options, see {@link https://github.com/andris9/Nodemailer#e-mail-message-fields `e-mail-message-fields`} for full description of email fields.
 * @param {Function} cb          - the callback function
 *
 * @returns {Function} the callback function
 */
Mailer.prototype.send = function(mailOptions, cb) {
    var self = this;
    
    // extend the default mail options with options passed by user
    self.options.mail = extend(self.options.mail, mailOptions);

    if(!self.options.mail.from) {
        return cb(new Error('Sender email address required'));
    }
    if(!self.options.mail.to) {
        return cb(new Error('Receiver email address required'));
    }

    // check if it should send text or template e-mail
    if(self.options.templatesDir && self.options.mail.templateName) {
        emailTemplates(self.options.templatesDir, self.options.templateEngineOptions, function (err, template) {
            if (err) {return cb(err);}

            template(self.options.mail.templateName, self.options.mail.templateContent, function (err, html, text) {
                if (err) {return cb(err);}

                self.options.mail.html = html;
                self.options.mail.text = text;

                // if we are testing don't send out an email instead return success, info response, html and txt strings for inspection
                if (process.env.NODE_ENV === 'test') {
                    return cb(null, '250 2.0.0 OK 1407018531 gc8sm23308604wic.3 - gsmtp', html, text);
                }

                self.transporter.sendMail(self.options.mail, function (err, info) {
                    if (err) {return cb(err);}

                    return cb(null, info.response, html, text);
                });
            });
        });
    } else {
        // if we are testing don't send out an email instead return success and info response for inspection
        if (process.env.NODE_ENV === 'test') {
            return cb(null, '250 2.0.0 OK 1407018531 gc8sm23308604wic.3 - gsmtp');
        }
        self.transporter.sendMail(self.options.mail, function (err, info) {
            if (err) {return cb(err);}

            return cb(null, info.response);
        });
    }
};

/**
 * Shut down the connection pool so no more messages are send (use if you don't
 * want to use transport object anymore).
 *
 * @method close
 */
Mailer.prototype.close = function() {
    this.transporter.close();
};

/**
 * Retrieves the Mailer configuration options.
 *
 * @method getOptions
 * @returns {Object} the mailer configuration options
 */
Mailer.prototype.getOptions = function() {
    return this.options;
};