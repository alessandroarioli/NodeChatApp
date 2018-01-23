var express = require('express');
var App = express();
var server = App.listen(8080);
var io = require('socket.io').listen(server);
var path = require('path');
var redis = require('redis');
var redisClient = redis.createClient();
var logger = require('./logger');
var { MongoDB } = require('./mongo-driver');

App.use(logger);

App.use(express.static('public'));


var storeMessage = function(nickname, data) {
  var message = JSON.stringify({ data: data });

  redisClient.lpush('messages', message, function(error, response) {
    redisClient.ltrim('messages', 0, 400);
  });
};

io.on('connection', function(client) {

  client.on('messages', function(data){
    var nickname = client.nickname;
    var message = {
      nickname: nickname,
      message: data
    };
    storeMessage(nickname, message);
    client.broadcast.emit('messages', message);
    client.emit('messages', message);
  });

  client.on('join', function(name) {
    client.nickname = name;

    redisClient.lrange('messages', 0, -1, function(error, messages) {
      messages = messages.reverse();

      messages.forEach(function(message) {
        message = JSON.parse(message);
        client.emit('messages', message.data);
      });
    });
  });

  client.on('typing', function(content) {
    var typingSentence;
    content ? typingSentence = client.nickname + ' is typing...' : typingSentence = '';

    client.broadcast.emit('typing', typingSentence);
  });

});
