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
var _              = require('lodash'),
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
 *          }
 *      });
 *      var mailOptions = {
 *          from: 'test@gmail.com',
 *          to: 'your.email@address.com',
 *          subject: 'Hello',
 *          text: 'Hello world!',
 *          html: '<b>Hello world!</b>'
 *      }
 *      mailer.send(mailOptions, function (err, respond) {
 *          if (err) return console.error(err);
 *          console.log('An e-mail has been sent successfully. Server responded with "' + respond + '"');
 *      });
 *  ```
 */
module.exports = Mailer;

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

    /**
     * Merge `options` with `custom options`.
     *
     * @type {Object} options - the default mailer options
     * @type {Object} options.config - the nodemailer configuration. See {@link https://github.com/andris9/nodemailer-smtp-transport `nodemailer-smtp-transport`} for full description of config fields.
     * @type {string} options.templatesDir - (optional) the templates directory path
     * @type {Object} options.templateEngineOptions - (optional) the template engine options e.g. helpers, partials etc. See {@link https://github.com/niftylettuce/node-email-templates#templating-language-options-eg-ejs-custom-tags `node-email-templates`} for options.
     * @private
     */
    this.options = _.merge({
        config: {},
        templatesDir: '',
        templateEngineOptions: {}
    }, options);
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

    if(!mailOptions.from) {
        return cb(new Error('Sender email address required'));
    }
    if(!mailOptions.to) {
        return cb(new Error('Receiver email address required'));
    }

    // check if it should send text or template e-mail
    if(self.options.templatesDir && mailOptions.templateName) {
        emailTemplates(self.options.templatesDir, self.options.templateEngineOptions, function (err, template) {
            if (err) {return cb(err);}

            template(mailOptions.templateName, mailOptions.templateContent, function (err, html, text) {
                if (err) {return cb(err);}

                mailOptions.html = html;
                mailOptions.text = text;

                // if we are testing don't send out an email instead return success, info response, html and txt strings for inspection
                if (process.env.NODE_ENV === 'test') {
                    return cb(null, '250 2.0.0 OK 1407018531 gc8sm23308604wic.3 - gsmtp', html, text);
                }

                self.transporter.sendMail(mailOptions, function (err, info) {
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
        self.transporter.sendMail(mailOptions, function (err, info) {
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