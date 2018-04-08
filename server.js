//let redis = require('redis');
//let redisClient = redis.createClient();
const express = require('express');
const App = express();
const server = App.listen(8080);
const io = require('socket.io').listen(server);
const fs = require('fs')
const path = require('path');
const logger = require('./logger');
const readline = require('readline')

const messagesCsv = "store_messages.csv"

App.use(logger);

App.use(express.static('public'));

let storeMessage = (data) => {
  let csv = [data.nickname, data.message].join(',') + '\n'

  fs.appendFile(messagesCsv, csv, (err) => {
    if (err) throw err;
    console.log('Saved!');
  });

  // Redis store message
  // redisClient.lpush('messages', message, function(error, response) {
  //   redisClient.ltrim('messages', 0, 400);
  // });

};

io.on('connection', (client) => {

  client.on('messages', (data) => {
    let nickname = client.nickname;

    let message = {
      nickname: nickname,
      message: data
    };
    
    storeMessage(message);
    client.broadcast.emit('messages', message);
    client.emit('messages', message);
  });

  client.on('join', (name) => {
    client.nickname = name;

    let lineReader = readline.createInterface({
      input: fs.createReadStream(messagesCsv)
    });
    
    lineReader.on('line', (line) => {
      let content = line.split(',')

      // Trim quotes
      content = content.map((component) => component.replace(/"/g, ''))
      
      client.emit('messages', {
        nickname: content[0],
        message: content[1]
      });
    });

    // Redis read messages
    // redisClient.lrange('messages', 0, -1, function(error, messages) {
    //   messages = messages.reverse();

    //   messages.forEach(function(message) {
    //     message = JSON.parse(message);
    //     client.emit('messages', message.data);
    //   });
    // });

  });

  client.on('typing', (content) => {
    let typingSentence;
    content ? typingSentence = client.nickname + ' is typing...' : typingSentence = '';

    client.broadcast.emit('typing', typingSentence);
  });

});
