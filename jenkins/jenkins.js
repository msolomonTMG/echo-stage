'use strict';

const request = require('request');

let baseUrl = "https://" + process.env.JENKINS_USER + ":" + process.env.JENKINS_TOKEN +"@jenkins-new.thrillist.com"
let headers = {
  Authorization: "Basic " + new Buffer(process.env.JENKINS_USER + ':' + process.env.JENKINS_TOKEN).toString('base64')
}

var helpers = {
  postToJob: function(branch, server) {
    return new Promise(function(resolve, reject) {
      let jobUrl = "/job/Thrillist%20-%20Staging%20-%20Front%20End%20Deploy%20(%20Step%202%20)/buildWithParameters?delay=0sec"
      let url = baseUrl + jobUrl

      let serverNumber = server.split(' ')[1]

      request.post({
        url: url + '&server_number=' + serverNumber + '&pinnacle_branch=' + branch,
        headers: headers
      }, function(err, resp) {
        if (!err) {
          helpers.getJobInfo(resp.headers.location).then(jobInfo => {
            return resolve(jobInfo)
          }).catch(err => {
            return reject(err)
          })
        } else {
          return reject(err)
        }
      })
    })
  },
  getJobInfo: function(url) {
    return new Promise(function(resolve, reject) {
      let jobUrl = baseUrl + url.split('https://jenkins-new.thrillist.com')[1] + 'api/json'
      request.get({
        url: jobUrl,
        headers: headers
      }, function(err, resp) {
        if (!err) {
          let json = JSON.parse(resp.body)
          let executable = json.executable.url
          let statusUrl = baseUrl + executable.split('http://jenkins-new.thrillist.com')[1] + 'api/json'
          request.get({
            url: statusUrl,
            headers: headers
          }, function(err, resp) {
            if (!err) {
              return resolve(JSON.parse(resp.body))
            } else {
              return reject(err)
            }
          })
        } else {
          return reject(err)
        }
      })
    })
  }
}

var functions = {
  deploy: function(branch, server) {
    return new Promise(function(resolve, reject) {
      helpers.postToJob(branch, server).then(job => {
        console.log('resolving jobs')
        let secondsRemaining = job.estimatedDuration / 1000
        return resolve(Math.round(secondsRemaining))
      }).catch(err => {
        console.log(err)
        return reject(err)
      })
    })
  }
}

module.exports = functions;
