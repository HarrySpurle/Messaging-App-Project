const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

// Create HTTP server to serve index.html
const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, "index.html");

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading file");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(content);
  });
});

// Attach WebSocket server to HTTP server
const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  console.log("User connected");

  socket.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  socket.on("close", () => {
    console.log("User disconnected");
  });
});

server.listen(8080, () => {
  console.log("Server running at http://localhost:8080");
});
