/**
 * app.js
 *
 * This file contains some conventional defaults for working with Socket.io + Sails.
 * It is designed to get you up and running fast, but is by no means anything special.
 *
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */


(function (io) {

  // as soon as this file is loaded, connect automatically,
  var socket = io.connect();
  if (typeof console !== 'undefined') {
    log('Connecting to Sails.js...');
  }

  socket.on('connect', function socketConnected() {

    // Listen for Comet messages from Sails
    socket.on('message', function messageReceived(message) {

      ///////////////////////////////////////////////////////////
      // Replace the following with your own custom logic
      // to run when a new message arrives from the Sails.js
      // server.
      ///////////////////////////////////////////////////////////
      log('New comet message received :: ', message);
      //////////////////////////////////////////////////////

    });


    ///////////////////////////////////////////////////////////
    // Here's where you'll want to add any custom logic for
    // when the browser establishes its socket connection to
    // the Sails.js server.
    ///////////////////////////////////////////////////////////
    log(
        'Socket is now connected and globally accessible as `socket`.\n' +
        'e.g. to send a GET request to Sails, try \n' +
        '`socket.get("/", function (response) ' +
        '{ console.log(response); })`'
    );
    ///////////////////////////////////////////////////////////


  });


  // Expose connected `socket` instance globally so that it's easy
  // to experiment with from the browser console while prototyping.
  window.socket = socket;


  // Simple log function to keep the example simple
  function log () {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }


})(

  // In case you're wrapping socket.io to prevent pollution of the global namespace,
  // you can replace `window.io` with your own `io` here:
  window.io

);

/**
 * Register Form
 */

(function ($) {
  var registerForm = $("#register form"),
    errorDiv = $("#error"),
    successDiv = $("#success"),
    username = registerForm.find("input[name=username]"),
    password = registerForm.find("input[name=password]"),
    passwordConfirm = registerForm.find("input[name=passwordConfirm]");

  errorDiv.hide();
  successDiv.hide();

  registerForm.submit(function (e) {
    e.preventDefault();

    errorDiv.hide();
    errorDiv.html("");
    successDiv.hide();
    successDiv.html("");

    if (password.val() === passwordConfirm.val()) {
      register(username.val(), password.val());
    } else {
      errorDiv.html("<p>Passwords must match.</p>");
      errorDiv.slideDown();
    }
  });

  var register = function (username, password) {
    $.post('/user', {
      username: username,
      password: password
    }).success(function (data) {
      successDiv.html("<p>Successfully create user " + data.username + ". You may log in now.</p>");
      successDiv.slideDown();
    }).fail(function (data) {
      errorDiv.html("<p>Error creating user.</p>");
      errorDiv.slideDown();
      console.log(data);
    });
  };
})(jQuery);

/**
 * Chat Room
 */

(function($) {
  var messageDiv = $('#messages'),
    newMessage = $('#new-message'),
    chatWindow = $('#chat'),
    userList = $('#users ul'),
    sendButton = $('#send-message');

  socket.request('/message');
  socket.request('/user');

  socket.on('message', function (msg) {
    console.log('message', msg);
    if (msg.data) {
      if (msg.data.body) {
        renderMessage(msg.data);
      } else if (msg.data.loggedIn !== undefined) {
        if (msg.data.loggedIn) {
          var username = msg.data.username;
          userList.append(
            '<li id="user-' + msg.data.id + '">' + username + '</li>'
          );
        } else {
          userList.find('#user-' + msg.data.id).remove();
        }
      } else {
        console.log(msg);
      }
    } else {
      console.log(msg);
    }
  });

  var setChatHeight = function () {
    var height = $(window).height();
    chatWindow.height(height - 130);
  };

  setInterval(setChatHeight, 100);

  var getPastMessages = function () {
    socket.get('/message', function (messages) {
      for (var i = 0, len = messages.length; i < len; i++) {
        renderMessage(messages[i]);
      }
    });
  };

  var getUsers = function () {
    socket.get('/user', function (users) {
      console.log(users);
      for (var i = 0; i < users.length; i++) {
        if (users[i].loggedIn === true) {
          userList.append(
            '<li id="user-' + users[i].id + '">' + users[i].username + '</li>'
          );
        }
      }
    });
  };

  getPastMessages();
  getUsers();


  var renderMessage = function (msg) {
    var time = moment(msg.createdAt).format('YYYY-MM-DD HH:mm');
    messageDiv.append(
      '<p><strong>' + msg.username + ': </strong> ' + msg.body
      + '<span class="time">' + time + '</span>'
      + '</p>'
    );
  };
  var sendMessage = function () {
    socket.post('/message', { body: newMessage.val() },
    function (data) {
      renderMessage(data);
    });
    newMessage.val('');
  };

  sendButton.click(sendMessage);
  newMessage.keydown(function (e) {
    if (e.which === 13) sendMessage();
  });
})(jQuery);
