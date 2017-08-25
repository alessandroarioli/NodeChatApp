var express = require('express');
var App = express();
var server = App.listen(8080);
var io = require('socket.io').listen(server);
var path = require('path');
var redis = require('redis');
var redisClient = redis.createClient();

App.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/' + 'index.html'));
});

App.get('/style.css', function(req, res) {
  res.sendFile(path.join(__dirname + '/' + 'resources' + '/' +'style.css'));
});

App.get('/socket.io.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/' + 'resources' + '/' +'socket.io.js'));
});

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
});
