'use strict';

const
  bodyParser = require('body-parser'),
  express = require('express'),
  echo = require('./echo'),
  github = require('./github'),
  jira = require('./jira'),
  https = require('https'),
  request = require('request');

var app = express();
app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json());

app.post('/api/v1/echo', function(req, res) {
  console.log(req.body)
  console.log(req.body.request.intent.slots)
  let intent = req.body.request.intent
  echo.manageIntent(intent).then(response => {
    res.send(response)
  }).catch(error => {
    res.send(error)
  })
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
module.exports = app;
