const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', socket => {
  console.log("User connected");

  socket.on('message', message => {
    console.log("Received:", message.toString());
    socket.send("Message received by server");
  });

  socket.on('close', () => {
    console.log("User disconnected");
  });
});

console.log("WebSocket server running on ws://localhost:8080");