'use strict';

const request = require('request');

var helpers = {
  makeGitHubRequest: function(url) {
    return new Promise(function(resolve, reject) {
      let options = {
        url: url,
        qs: {
          access_token: process.env.GITHUB_TOKEN
        },
        headers: {
          'User-Agent': 'msolomonTMG'
        }
      }
      request(options, function(err, resp) {
        if (!err) {
          return resolve(JSON.parse(resp.body))
        }
      })
    })
  }
}

var functions = {
  findBranchByTicket: function(ticket) {
    return new Promise(function(resolve, reject) {
      helpers.makeGitHubRequest('https://api.github.com/repos/Thrillist/Pinnacle/issues').then(issues => {
        let ticketRegex = new RegExp(ticket, "gi")
        issues.forEach(issue => {
          if (issue.title.match(ticketRegex) && issue.pull_request) {
            helpers.makeGitHubRequest(issue.pull_request.url).then(pullRequest => {
              return resolve(pullRequest.head.ref)
            }).catch(err => {
              return reject(err)
            })
          }
        })
      }).catch(err => {
        return reject(err)
      })
    })
  }
}

module.exports = functions;
