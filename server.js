const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { Users } = require("../client/src/utils/users");
const path = require("path");
const publicPath = path.join(__dirname, "../client/public");
const { BOARD_HEIGHT, BOARD_WIDTH } = require("../client/src/config");
let app = express();
let server = http.createServer(app);
const port = process.env.PORT || 3000;
let io = socketIO(server);
const MAX_CELLS = BOARD_WIDTH * BOARD_HEIGHT;
let users = new Users();
users.users = [];
let food = Math.ceil(Math.random() * MAX_CELLS - 1);

app.use(express.static(publicPath));
io.on("connection", socket => {
  console.log("New User !");
  let user = {
    id: socket.id,
    head: null
  };
  users.addUser(user);
  socket.emit("getFood", food);
  socket.on("myPosition", user => {
    console.log("inside my position server");
    console.log(user.head);
    console.log(users.users);
    for (let i = 0; i < users.users.length; i++) {
      if (users.users[i].id === user.id) {
        users.updateUser(user);
        break;
      }
    }
    socket.broadcast.emit("enemyPosition", user);
  });

  socket.on("dead", user => {
    users.removeUser(user.id);
  });

  socket.on("foodEaten", () => {
    console.log("inside food eaten server");
    food = Math.ceil(Math.random() * MAX_CELLS - 1);
    io.emit("getFood", food);
  });

  socket.on("disconnect", () => {
    console.log("Got disconnect!");
    for (i = 0; i < users.length; i++) {
      if (users.users[i].id == socket.id) {
        users.splice(i, 1);
        break;
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
