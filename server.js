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
    if (request.url === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (msg) => {
      let messageObj;

      try {
        // Convert Buffer to string if needed
        const jsonString = msg instanceof Buffer ? msg.toString("utf-8") : msg;
        messageObj = JSON.parse(jsonString);
      } catch (err) {
        console.error("Failed to parse message:", err);
        return;
      }

      console.log("Received:", messageObj);

      // Broadcast JSON string to all clients
      const broadcastData = JSON.stringify(messageObj);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(broadcastData);
      });
    });

    ws.on("close", () => console.log("Client disconnected"));

    ws.on("error", (err) =>
      console.warn("WebSocket error (ignored in dev):", err.message)
    );
  });

  server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});
