const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const publicPath = path.join(__dirname, "../client/public");
const { Users } = require("../client/src/utils/users");
const { createApple, createSnake } = require('../client/src/utils/helpers').default;

let app = express();
let server = http.createServer(app);
const port = process.env.PORT || 3000;
let io = socketIO(server);
let users = new Users();
let apple = createApple();
app.use(express.static(publicPath));
io.sockets.on("connection", socket => {
  console.log("New User Connected!");
  let user = {
    id: socket.id,
    snake: []
  };
  users.addUser(user);
  socket.emit("newApple", apple);
  socket.on("myPosition", user => {
    for (let i = 0; i < users.users.length; i++) {
      if (users.users[i].id === user.id) {
        users.updateUser(user);
        break;
      }
    }
    socket.broadcast.emit("enemyPosition", user);
  });

  socket.on("dead", user => {
    user.snake = [];
    io.emit('enemyDead', user);
  });

  socket.on("getApple", () => {
    apple = createApple();
    io.emit("newApple", apple);
  });

  socket.on("getSnake", () => {
    const snake = createSnake();

    socket.emit("newSnake", snake);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnect!");
    for (let i = 0; i < users.users.length; i++) {
      if (users.users[i].id === socket.id) {
        users.removeUser(socket.id);
        break;
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
