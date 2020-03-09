/*
  Author: Siobhan Chevy O'Dell
  Last revision: 08/03/2020
*/

$(function () {
    var socket = io();

    if(document.cookie === ""){
      socket.emit('initialConnect');
    }
    else {
      socket.emit('initialConnectCookie',document.cookie);
    }

    //********** when a message is sent **********//
    $('form').submit((e) => {
      e.preventDefault(); // prevents page reloading

      let splitInput = $('#input').val().split(" ");

      if(splitInput[0] === "/nick" || splitInput[0] === "/nickcolor"){
        socket.emit('sendAction', {
          action: splitInput[0],
          value: $('#input').val()
        });
      }
      else {
        socket.emit('sendMessage', {
          message: $('#input').val()
        });
      }

      $('#input').val('');
      return false;
    });

    //********** when a message is recieved **********//
    socket.on('getMessage', (data) => {
      let formattedDate = data.timestamp.slice(11,19);
      let formattedMessage = formattedDate + "\t\t<font color=#" + data.color + ">" + data.username + ":</font>\t" + data.message;
      if(data.username === $('#currentUser').text()){
        $('#messages').prepend($('<li>').html("<b>"+formattedMessage+"</b>"));
      }
      else {
        $('#messages').prepend($('<li>').html(formattedMessage));
      }
    });

    //********** recieve information from the server **********//
    socket.on('initialConnection', (data) => {

      let myInfo = data.myInfo;
      let users = data.allUsers;
      let messages = data.allMessages;

      $('#currentUser').html("<b><font color=#" + data.myInfo.color + ">"+ data.myInfo.username + "</font>"+"</b>");
      $('#messages').append($('<li>').html("<b><font color=#" + data.myInfo.color + ">"+"---You are " + data.myInfo.username+ "---</font>"+"</b>"));

      document.cookie = "username=" + data.myInfo.username;
      document.cookie = "color=" + data.myInfo.color;

      messages.forEach((item, i) => {
        let formattedDate = item.timestamp.slice(11,19);
        let formattedMessage = formattedDate + "\t\t<font color=#" + item.color + ">" + item.username + ":</font>\t" + item.message;
        $('#messages').prepend($('<li>').html(formattedMessage));

      });

      users.forEach((item, i) => {
        $('#users').append($('<li>').html("<font color=#" + item.color + ">" + item.username + "</font>"));
      });
    });

    //********** recieve information from the server **********//
    socket.on('initialConnectionCookie', (data) => {

      let myInfo = data.myInfo;
      let users = data.allUsers;
      let messages = data.allMessages;

      $('#currentUser').html("<b><font color=#" + data.myInfo.color + ">"+ data.myInfo.username + "</font>"+"</b>");
      $('#messages').prepend($('<li>').html("<b><font color=#" + data.myInfo.color + ">"+"---You are " + data.myInfo.username+ "---</font>"+"</b>"));

      document.cookie = "username=" + data.myInfo.username;
      document.cookie = "color=" + data.myInfo.color;

      messages.forEach((item, i) => {
        let formattedDate = item.timestamp.slice(11,19);
        let formattedMessage = formattedDate + "\t\t<font color=#" + item.color + ">" + item.username + ":</font>\t" + item.message;
        $('#messages').prepend($('<li>').html(formattedMessage));
      });

      users.forEach((item, i) => {
        $('#users').append($('<li>').html("<font color=#" + item.color + ">" + item.username + "</font>"));
      });
    });

    //********** add a new user to the userlog **********//
    socket.on('newUser', (data) => {
      $('#users').append($('<li>').html("<font color=#" + data.color + ">"+ data.username + "</font>"));
      $('#messages').prepend($('<li>').html("<b><font color=#" + data.color + ">"+"\>\>\>" + data.username + " has joined the chat!\<\<\<</font>"+"</b>"));
    });

    //********** mention that a user has left **********//
    socket.on('userLeftMessage', (data) => {
      $('#messages').prepend($('<li>').html("<b><font color=#" + data.color + ">"+"\>\>\>" + data.username + " has left the chat!\<\<\<</font>"+"</b>"));
    });

    //********** successful username changeEvent **********//
    socket.on('changedUsername', (data) => {
      document.cookie = "username=" + data.name;
      $('#currentUser').html("<b><font color=#" + data.color + ">"+ data.name + "</font></b>");
      $('#messages').prepend($('<li>').html("<b><font color=#" + data.color + ">"+"---You are now " + data.name + "---</font>"+"</b>"));
    });

    //********** username changeEvent Message**********//
    socket.on('changedUsernameMessage', (data) => {
      $('#messages').prepend($('<li>').html("<b><font color=#" + data.color + ">"+"\>\>\>" + data.prev + " changed their name to " + data.new + "\<\<\<</font>"+"</b>"));
    });

    //********** unsuccessful changeEvent **********//
    socket.on('error', (data) => {
      $('#messages').prepend($('<li>').text(data));
    });

    //********** successful color changeEvent **********//
    socket.on('changedColor', (data) => {
      document.cookie = "color=" + data;
      let username = $('#currentUser').text();
      $('#currentUser').html("<b><font color=#" + data + ">"+ username + "</font></b>");
      $('#messages').prepend($('<li>').html("<b><font color=#" + data + ">"+"---Your color is now: #" + data + "---</font>"+"</b>"));
    });

    //********** color changeEvent Message**********//
    socket.on('changedColorMessage', (data) => {
      $('#messages').prepend($('<li>').html("<b><font color=#" + data.color + ">"+"\>\>\>" + data.name + "'s new color is #" + data.color + "\<\<\<</font>"+"</b>"));
    });

    //********** update userlog **********//
    socket.on('userlogUpdate', (data) => {
      $('#users').text("");
      data.forEach((item, i) => {
        $('#users').append($('<li>').html("<font color=#" + item.color + ">" + item.username + "</font>"));
      });
    });

});
