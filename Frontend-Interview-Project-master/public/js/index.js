$(document).ready(function () {

  // Set's sidebar's theme for scrollbar
  $("#sidebar").mCustomScrollbar({
    theme: "minimal"
  });

  // Select room when you click on it
  $('#room-list').on('click', '.room', selectRoom);

  // Login when user submits username
  $('#login-form').submit(function (event) {
    event.preventDefault();
    setUsername();
    setElapsedMinutes();
    openChatRoom();
    let url = "http://localhost:8080/api/rooms";
    getRoomList(url);
  });

  // Send messages when user types in a message and clicks send
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

//Retrieves the list of rooms from API. Then grabs the details about the room and messages stored in chat room
function getRoomList(url) {
  $.get(url, function(response) {
    let rooms = response.sort(compare);
    for (let i = 0; i < rooms.length; i++) {
      createRoom(rooms[i].id, rooms[i].name, i);
    }
    getRoomDetails();
    getMessages();
  });
};

//A function to compare values if a is greater than b
function compare(a,b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
};

//Creates room elements to be added to the list in HTML
function createRoom(id, name, elemNum) {
  let room = document.createElement('li');
  let link = document.createElement('a');
  let list = document.getElementById('room-list');

  room.setAttribute('class', 'room');
  if (elemNum === 0) {
    room.setAttribute('class', 'room active');
  }
  room.setAttribute('id', id);
  room.setAttribute('onclick', 'selectRoom()');

  link.innerHTML = name;
  link.setAttribute('href', '#');

  list.appendChild(room);
  room.appendChild(link);
};

//Sets the sidebar with username and adds the current user to top with room details
function setUsername() {
  let username = $('#username').val().trim();
  $('#sidebar-username').text(username);
  $('#current-user').html(username);
};

//Opens up the chat room upon login
function openChatRoom() {
  $('#login').toggleClass('hidden');
  $('#sidebar').toggleClass('hidden');
  $('#chat-room').toggleClass('hidden');
};

//Selects room on click
function selectRoom() {
  $('.active').toggleClass('active');
  $(this).toggleClass('active');
  getRoomDetails();
  getMessages();
};

//Retrieves room details from API and displays the users and room name at top
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
        if (users[i].toLowerCase() !== $('#current-user').text().toLowerCase()) {
          userHtml += ', ' + users[i];
        }
      }
      $('#users').text(userHtml);
    });
  }
};

//Retrieves messages for a selected room and focuses the scrollbar to the bottom for most recent messages
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

        if (name.toLowerCase() === currentUser.toLowerCase()) {
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

//Posts message to the room API when user types a message and clicks send
function sendMessage(url) {
  let name = $('#current-user').text();
  name = name.charAt(0).toUpperCase() + name.slice(1);
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

//Focuses the chat window's scrollbar to the bottom
function scrollBottomFocus() {
  let chatWindow = document.getElementById('chat-window');
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

//Calculates the elapsed minutes user has been online since login
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
