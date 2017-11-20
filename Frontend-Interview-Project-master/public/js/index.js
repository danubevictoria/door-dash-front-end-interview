$(document).ready(function () {

  // SIDEBAR
  $("#sidebar").mCustomScrollbar({
    theme: "minimal"
  });

  // Select room when you click on it
  $('#room-list').on('click', '.room', selectRoom);

  // LOGIN
  $('#login-form').submit(function (event) {
    event.preventDefault();
    setUsername();
    setElapsedMinutes();
    openChatRoom();
    let url = "http://localhost:8080/api/rooms";
    getRoomList(url);
  });

  // Send messages
  $("#message-form").submit(function (event) {
    event.preventDefault();
    let activeRoom = document.getElementsByClassName('room active');

    if (activeRoom.length > 0) {
      let id = activeRoom[0].id;
      let url = "http://localhost:8080/api/rooms/" + id + "/messages";
      sendMessage(url);
    }
  })
});

function getRoomList(url) {
  $.get(url, function(response) {
    for (let i = 0; i < response.length; i++) {
      createRoom(response[i].id, response[i].name);
    }
    getRoomDetails();
    getMessages();
  });
};

function createRoom(id, name) {
  let room = document.createElement('li');
  let link = document.createElement('a');
  let list = document.getElementById('room-list');

  room.setAttribute('class', 'room');
  if (id === 0) {
    room.setAttribute('class', 'room active');
  }
  room.setAttribute('id', id);
  room.setAttribute('onclick', 'selectRoom()');

  link.innerHTML = name;
  link.setAttribute('href', '#');

  list.appendChild(room);
  room.appendChild(link);
};

function setUsername() {
  let username = $('#username').val().trim();
  $('#sidebar-username').text(username);
  $('#current-user').html(username);
};

function openChatRoom() {
  $('#login').toggleClass('hidden');
  $('#sidebar').toggleClass('hidden');
  $('#chat-room').toggleClass('hidden');
};

function selectRoom() {
  $('.active').toggleClass('active');
  $(this).toggleClass('active');
  getRoomDetails();
  getMessages();
};

function getRoomDetails() {
  let activeRoom = document.getElementsByClassName('room active');

  if (activeRoom.length > 0) {
    let id = activeRoom[0].id;
    let url = "http://localhost:8080/api/rooms/" + id;
    $.get(url, function(response) {
      // set room name
      $('#room-name').html(response.name);

      // set users
      let users = response.users;
      let userHtml = '';

      for (let i = 0; i < users.length; i++) {
        if (users[i] !== $('#current-user').text()) {
          userHtml += ', ' + users[i];
        }
      }
      $('#users').text(userHtml);
    });
  }
};

function getMessages() {
  let activeRoom = document.getElementsByClassName('room active');
  let id;
  if (activeRoom.length > 0) {
    id = activeRoom[0].id;
    let url = "http://localhost:8080/api/rooms/" + id + "/messages";
    let currentUser = $('#current-user').text();
    let messageList = document.getElementById('message-list');
    messageList.innerHTML = '';

    $.get(url, function (response) {
      for (let i = 0; i < response.length; i++) {
        let name = response[i].name;
        let message = response[i].message;

        let message_li = document.createElement('li');
        let from_p = document.createElement('p');
        let messageText = document.createTextNode(message);
        let fromText = document.createTextNode(name);

        if (name === currentUser) {
          message_li.setAttribute('class', 'my-message pull-right');
          message_li.appendChild(messageText);

          messageList.appendChild(message_li);
        } else {
          message_li.setAttribute('class', 'message pull-left');
          message_li.appendChild(messageText);

          from_p.setAttribute('class', 'message-from');
          from_p.appendChild(fromText);

          messageList.appendChild(message_li);
          messageList.appendChild(from_p);
        }
      }

      scrollBottomFocus();
    });
  }
};

function sendMessage(url) {
  let name = $('#current-user').text();
  let message = $('#message').val();

  $.post(url, { name:name, message:message }, function(data) {
    let myMessage = document.createElement('li');
    let myMessageText = document.createTextNode(message);
    let messageList = document.getElementById('message-list');

    myMessage.setAttribute('class', 'my-message pull-right');
    myMessage.appendChild(myMessageText);

    messageList.appendChild(myMessage);

    scrollBottomFocus();
  });
};

function scrollBottomFocus() {
  let chatWindow = document.getElementById('chat-window');
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

function setElapsedMinutes() {
  let start = 0;
  let interval = setInterval(increment, 60000);

  function increment() {
    start++;
    let startHtml = ' for ' + start;
    if (start > 1) {
      startHtml += ' minutes';
    } else {
      startHtml += ' minute';
    }
    $("#elapsed-minutes").text(startHtml);
  }
};
