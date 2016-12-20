'use strict';

const request = require('request')

let baseUrl = "https://thrillistmediagroup.atlassian.net/rest/api/2"
let headers = {
  Authorization: "Basic " + new Buffer(process.env.JIRA_USER + ':' + process.env.JIRA_PASSWORD).toString('base64'),
  'Content-Type': "application/json"
}

var functions = {
  getTicketFromQuery: function(query) {
    return new Promise(function(resolve, reject) {
      let data = {
        jql: "PROJECT = TR and text ~ '" + query + "'",
        fields: [
          "key",
          "summary"
        ]
      }
      request.post({
        url: baseUrl + '/search',
        headers: headers,
        body: JSON.stringify(data)
      }, function(err, resp) {
        if (!err) {
          console.log(resp.body)
          let json = JSON.parse(resp.body)
          let ticketInfo = {
            key: json.issues[0].key,
            summary: json.issues[0].fields.summary
          }
          console.log(ticketInfo)
          return resolve(ticketInfo)
        } else {
          return reject(err)
        }
      })
    })
  }
}

module.exports = functions;
