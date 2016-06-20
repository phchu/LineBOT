var express = require('express');
var request = require('request');
var config = require('../config');
var router = express.Router();

/* GET line bot callback. */
router.post('/', function(req, res, next) {
  console.log('callback: ', req.body);     
  var result = req.body.result;
  for(var i = 0; i < result.length; i++){
      var data = result[i].content;
      console.log('message content: ', data);
      queryProfile(data.from, function(user) {
        var reply_msg;
        if(String(data.text).indexOf('Hi,') > -1){
          reply_msg = 'Hi, '.concat(user);
          sendMessage(data.from, reply_msg, config.LINE.TEXT);
        }else{
          reply_msg = 'https://sdl-stickershop.line.naver.jp/products/0/0/4/1331/android/stickers/23770.png';
          sendMessage(data.from, reply_msg, config.LINE.IMAGE);
        }        
      });      
    }  
});

function sendMessage(sender, content, type) {
  console.log('Send message: ', content);
  var query_fields = 'events';
  var data;
  switch (type) {
    case config.LINE.TEXT:
      data = {
        to: [sender],                   //Array of target user. Max count: 150.
        toChannel: 1383378250,          //Fixed value
        eventType: '138311608800106203',//Fixed value
        content: {
          contentType: type,
          toType: 1,
          text: content
        }
      };
      break;
    case config.LINE.IMAGE:
      data = {
        to: [sender],
        toChannel: 1383378250,
        eventType: '138311608800106203',
        content: {
          contentType: type,
          toType: 1,
          originalContentUrl: content,
          previewImageUrl: content
        }
      };
      break;
    default:
      break;
  }
  console.log('Send data: ', data);
  
  request({
    url: config.LINE.API.concat(query_fields),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Line-ChannelID': config.LINE.CHANNEL_ID,
      'X-Line-ChannelSecret': config.LINE.CHANNEL_SERECT,
      'X-Line-Trusted-User-With-ACL': config.LINE.MID
    },
    method: 'POST',
    body: JSON.stringify(data)
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    console.log('Send message response: ', body);
  });
}

function queryProfile(sender, callback) {
  var query_fields = 'profiles?mids=';
  request({
    url: config.LINE.API.concat(query_fields, sender),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Line-ChannelID': config.LINE.CHANNEL_ID,
      'X-Line-ChannelSecret': config.LINE.CHANNEL_SERECT,
      'X-Line-Trusted-User-With-ACL': config.LINE.MID
    },
    method: 'GET'
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    var jsonResult = JSON.parse(body);
    console.log('Profile response: ', jsonResult);  
    for (var i = 0; i < jsonResult.count; i++) {      
      var userName = jsonResult.contacts[i].displayName;
      console.log('User name: ', userName);
      callback(userName);
    }      
  });
}

module.exports = router;
