const { createServer } = require("http");
const next = require("next");
const WebSocket = require("ws");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  const wss = new WebSocket.Server({ noServer: true, path: "/ws" });

  server.on("upgrade", (request, socket, head) => {
    // Only accept upgrades to "/ws"
    if (request.url === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy(); // Reject other upgrade requests
    }
  });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (msg) => {
      console.log("Received:", msg.toString());
      // Broadcast
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(msg.toString());
      });
    });

    ws.on("close", () => console.log("Client disconnected"));
    ws.on("error", (err) =>
      console.warn("WebSocket error (ignored in dev):", err.message)
    );
  });

  server.listen(3000, () => {
    console.log("Next.js + WebSocket server running on http://localhost:3000");
  });
});
