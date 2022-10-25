/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import fetch from 'node-fetch';
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var token = process.env.TOKEN || 'token';
var received_updates = [];

app.get('/', function(req, res) {
  console.log(req);
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get(['/facebook', '/instagram'], function(req, res) {
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == token
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post('/facebook', function(req, res) {
  console.log('Facebook request body:', req.body);

  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('request header X-Hub-Signature validated');
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post('/send', function(req, res) {
    fetch('http://graph.facebook.com/v15.0/101638086024149/messages', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer EAAR0LV67X3wBANn2D2VUbp7DkW9C7pwzB0J7LudRJeZBlZBpFMXvami4ktP588w5d1Sd12ApG8FFItA3NKIRtZAZCZCl1F8KFlerOMq9f6koZBB5XFoaK5y4dZCZBcjsCTYj3fsNmfL0QZBFepsOeVRCCk8M8Wkdln06cajfZAUWkWptRuJLN2c3X9OZBZCoHwxfZAuzUEthAgbF3oMFf9UsobyXt',
            'Content-Type': 'application/json'
        },
        body: '{ \\"messaging_product\\": \\"whatsapp\\", \\"to\\": \\"380961387269\\", \\"type\\": \\"template\\", \\"template\\": { \\"name\\": \\"hello_world\\", \\"language\\": { \\"code\\": \\"en_US\\" } } }'
    });
});
app.listen();
