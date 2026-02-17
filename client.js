const WebSocket = require('ws');

const socket = new WebSocket('ws://localhost:8080');

socket.on('open', () => {
  console.log("Connected to server");
  socket.send("Hello server!");
});

socket.on('message', (data) => {
  console.log("Server says:", data.toString());
});