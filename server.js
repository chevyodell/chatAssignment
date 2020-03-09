/*
  Author: Siobhan Chevy O'Dell
  Last revision: 08/03/2020
*/

//********** set basics up **********//
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var path = require('path');
var io = require('socket.io')(http);

//********** set up used files on client side **********//
app.use(express.static(path.join(__dirname,'public')));

//********** port the server is listening on **********//
http.listen(3000, () => {
  console.log('listening on *:3000');
});

//********** variables **********//
let uniqueUsername = 0;
let userlog = [];
let chatlog = [];

//********** events during socket connection **********//
io.on('connection', (socket) => {
  console.log('a user connected');

  //********** on initial connection **********//
  socket.on('initialConnect', () => {
    //create new user info
    let userObj = {
      username:   "User" + uniqueUsername.toString(),
      color:    "000000"
    };
    uniqueUsername++;
    socket.username = userObj.username;

    //tell everyone about the new user
    socket.broadcast.emit('newUser', userObj);
    userlog.push(userObj);

    //put together all the info the new user needs to know
    let info = {
      myInfo:       userObj,
      allUsers:     userlog,
      allMessages:  chatlog
    };

    //send all the info to the new user
    socket.emit('initialConnection', info);
  });

  //********** on initial connection if the socket got cookie **********//
  socket.on('initialConnectCookie', (cookie) => {

    let allCookies = cookie.split(";");
    let oldName = allCookies[0].slice(9);

    let userObj;

    if(checkValidUsername(oldName)){
      userObj = {
        username:   oldName,
        color: "000000"
      };
    }
    else {
      userObj = {
        username:   "User" + uniqueUsername.toString(),
        color: "000000"
      };
      uniqueUsername++;
    }

    socket.username = userObj.username;

    //tell everyone about the new user
    socket.broadcast.emit('newUser', userObj);
    userlog.push(userObj);

    //put together all the info the new user needs to know
    let info = {
      myInfo:       userObj,
      allUsers:     userlog,
      allMessages:  chatlog
    };

    //send all the info to the user
    socket.emit('initialConnectionCookie', info);
  });

  //********** on disconnection **********//
  socket.on('disconnect', () => {
    console.log('user disconnected');
    let i = userlog.map((e) => {return e.username;}).indexOf(socket.username);

    socket.broadcast.emit('userLeftMessage', userlog[i]);
    userlog.splice(i,1);

    socket.broadcast.emit('userlogUpdate', userlog);
  });

  //********** on recieving a message from a user **********//
  socket.on('sendMessage', (data) => {
    let i = userlog.map((e) => {return e.username;}).indexOf(socket.username);

    let chatObj = {
      timestamp:  new Date(),
      username:   socket.username,
      color:      userlog[i].color,
      message:    data.message
    };

    io.emit('getMessage', chatObj);
    chatlog.push(chatObj);
  });

  //********** on action **********//
  socket.on('sendAction', (data) => {

    if(data.action === "/nick"){
      let newNick = data.value.slice(6);

      //check if the username is unique
      if (checkValidUsername(newNick)) {

        let i = userlog.map((e) => {return e.username;}).indexOf(socket.username);
        userlog[i].username = newNick;
        socket.broadcast.emit('changedUsernameMessage', {prev: socket.username, new: newNick, color: userlog[i].color});
        socket.username = newNick;

        //update all userlog
        io.emit('userlogUpdate', userlog);

        //change Username
        socket.emit('changedUsername', {name: newNick, color: userlog[i].color});
      }
      else {
        //change Username error
        socket.emit('error', "*** Invalid Username: Must be unique ***");
      }
    }
    else if(data.action === "/nickcolor"){
      let newColor = data.value.slice(11);

      if (checkValidColor(newColor)) {

        let i = userlog.map((e) => {return e.username;}).indexOf(socket.username);
        userlog[i].color = newColor;

        //update all userlog
        io.emit('userlogUpdate', userlog);
        socket.broadcast.emit('changedColorMessage', {color: newColor, name: socket.username});

        //change Username
        socket.emit('changedColor', newColor);
      }
      else {
        //change Username error
        socket.emit('error', "*** Invalid Color: Must be RRGGBB in hex ***");
      }
    }
  });
});

//***************** HELPER FUNCTIONS *****************//
//********** helper function - valid username **********//
function checkValidUsername(name){
  let i = userlog.map((e) => {return e.username;}).indexOf(name);
  if(i === -1 && name !== ""){
    return true;
  }
  return false;
}

//********** helper function - valid color **********//
function checkValidColor(color){
  var re = /[0-9A-Fa-f]{6}/g;
  if(re.test(color)){
    return true;
  }
  return false;
}
