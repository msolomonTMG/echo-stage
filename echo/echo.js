'use strict';

const
  github = require('../github'),
  jenkins = require('../jenkins'),
  jira = require('../jira');

var helpers = {
  deploy: function(deployInfo) {
    return new Promise(function(resolve, reject) {
      jira.getTicketFromQuery(deployInfo.Query.value).then(ticketInfo => {
        github.findBranchByTicket(ticketInfo.key).then(branch => {
          jenkins.deploy(branch, deployInfo.Server.value).then(secondsRemaining => {
            let responseData = {
              ticket: ticketInfo,
              secondsRemaining: secondsRemaining
            }
            return resolve(responseData)
          }).catch(err => {
            return reject(err)
          })
        }).catch(err => {
          return reject(err)
        })
      })
    })
  },
  formatResponse: function(speech) {
    return new Promise(function(resolve, reject) {
      return resolve({
        version: 1.0,
        sessionAttributes: {},
        response: {
          shouldEndSession: true,
          outputSpeech: {
            type: "SSML",
            ssml: "<speak>" + speech + "</speak>"
          }
        }
      })
    })
  }
}

var functions = {
  manageIntent: function(intent) {
    return new Promise(function(resolve, reject) {
      switch(intent.name) {
        case 'Deploy':
          helpers.deploy(intent.slots).then(jobData => {
            helpers.formatResponse('Deploying ' + jobData.ticket.summary + ' to ' + intent.slots.Server.value + '. ETA: ' + jobData.secondsRemaining + ' seconds').then(response => {
              return resolve(response)
            })
          })
          break;
      }
    })
  }
}

module.exports = functions;
