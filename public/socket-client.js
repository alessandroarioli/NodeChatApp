var host = location.origin.replace(/^http/, 'ws')
var socket = io.connect(host);
var nickname, rightLeft;

function ScrollToBottom() {
  var messagesContainer = document.getElementById('messages_list');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

document.getElementById('send_message_button').addEventListener("click", function() {
  var message = document.getElementById("message_input_field").value;

  document.getElementById("message_input_field").value = '';
  if (message) {
    socket.emit('messages', message);
  };
});

document.getElementById('message_input_field').addEventListener("keyup", function(event) {
  socket.emit('typing', true);
  event.preventDefault();
  if (event.keyCode == 13) {
    socket.emit('typing', false);
    document.getElementById('send_message_button').click();
  }});


// Socket.io events
socket.on('connect', function(data) {
  roomName = (localStorage.getItem('room-name')) ? localStorage.getItem('room-name') : prompt('Insert room name');
  nickname = (localStorage.getItem('nickname')) ? localStorage.getItem('nickname') : prompt('Insert your nickname');
  localStorage.setItem('room-name', roomName);
  localStorage.setItem('nickname', nickname);
  socket.emit('join', roomName, nickname);
});

socket.on('messages', function(data) {
  (data.nickname === nickname) ? rightLeft = 'left' : rightLeft = 'right';
  var messageHtml = "<li class='message messageType appeared'><div class='avatar'></div><div class='text_wrapper'><div class='text'><i>" + data.nickname + "</i>  :  " + data.message + "</div></div></li>";
  messageHtml = messageHtml.replace('messageType', rightLeft);
  document.getElementById('messages_list').innerHTML += messageHtml;
  ScrollToBottom();
});

socket.on('typing', function(data) {
  document.getElementById('typing-area').innerHTML = data;
});
