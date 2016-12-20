'use strict';

const github = require('../github')
const jenkins = require('../jenkins')

var helpers = {
  deploy: function(deployInfo) {
    return new Promise(function(resolve, reject) {
      github.findBranchByTicket(deployInfo.Ticket.value).then(branch => {
        jenkins.deploy(branch, deployInfo.Server.value).then(secondsRemaining => {
          return resolve(secondsRemaining)
        }).catch(err => {
          return reject(err)
        })
      }).catch(err => {
        return reject(err)
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
          helpers.deploy(intent.slots).then(secondsRemaining => {
            console.log(secondsRemaining)
            helpers.formatResponse('Deploying to ' + intent.slots.Server.value + '. ETA: ' + secondsRemaining + ' seconds').then(response => {
              return resolve(response)
            })
          })
          break;
      }
    })
  }
}

module.exports = functions;
