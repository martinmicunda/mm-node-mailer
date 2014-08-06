[![NPM version](https://badge.fury.io/js/mm-node-mailer.svg)](http://badge.fury.io/js/mm-node-mailer)
mm-node-mailer
==============

A node module that send e-mails.

## Installation

```bash
$ npm install mm-node-mailer --save
```

## Usages
The `mm-node-mailer` is based upon the awesome [Nodemailer](https://github.com/andris9/Nodemailer), so you will have to configure it before usage.

#### Text email
```js
var mailer = mmMailer({
    config: {
        service: 'Gmail',
        auth: {
            user: 'test@gmail.com',
            pass: 'password'
        }
    },
    mail: {
        from: 'test@gmail.com',
        to: 'your.email@address.com',
        subject: 'Hello',
        text: 'Hello world ✔',
        html: '<b>Hello world ✔</b>'
    }
});
mailer.send({}, function (err, data) {
    if (err) return console.error(err);
    console.log('An e-mail has been sent successfully. Server responded with "' + data + '"');
});
```

#### Template email
```js
var mailer = mmMailer({
    config: {
        service: 'Gmail',
        auth: {
            user: 'test@gmail.com',
            pass: 'password'
        }
    },
    mail: {
        from: 'test@gmail.com',
        subject: 'Newsletter'
    },
    templatesDir: path.resolve(__dirname + '/templates')
});
var mailOptions = {
    to: 'your.email@address.com',
    templateName: 'newsletter',
    templateContent: {
        email: 'mamma.mia@spaghetti.com',
        name: {
            first: 'Mamma',
            last: 'Mia'
        }
    }
}
mailer.send(mailOptions, function (err, data) {
    if (err) return console.error(err);
    console.log('An e-mail has been sent successfully. Server responded with "' + data + '"');
});
```

## Examples
Clone the `mm-node-mailer` repo and then install all dependencies:
```bash
$ git clone git@github.com:martinmicunda/mm-node-mailer.git 
$ cd mm-node-mailer
$ npm install 
```

Then run whichever example you want go to examples directory and run: 
```bash
$ EMAIL=your.email@address.com node email 
```
or
```bash
$ EMAIL=your.email@address.com node template-email 
```
You can also view live examples here:

<a href="http://runnable.com/U-I3ooLFYVYguhni/mm-mongoose-connection-example-for-node-js-mongodb-and-express" target="_blank"><img src="https://runnable.com/external/styles/assets/runnablebtn.png" style="width:67px;height:25px;"></a>

## Tests
To run the test suite, first invoke the following command within the repo, installing the development dependencies:

```bash
$ npm install
```

Then run the tests:

```bash
$ npm test
```

## License

    The MIT License
    
    Copyright (c) 2014 Martin Micunda  

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.