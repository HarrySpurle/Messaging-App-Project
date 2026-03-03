require("dotenv").config();

const { createServer } = require("http");
const next = require("next");
const WebSocket = require("ws");
const { MongoClient } = require("mongodb");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env");
  process.exit(1);
}

let messagesCollection;

async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db("chatapp");
    messagesCollection = db.collection("messages");

    // Index for sorting messages by time
    await messagesCollection.createIndex({ createdAt: 1 });

    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

async function startServer() {
  await app.prepare();
  await connectDB();

  const server = createServer((req, res) => handle(req, res));
  const wss = new WebSocket.Server({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    if (request.url === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", async (ws) => {
    console.log("Client connected");

    try {
      const history = await messagesCollection
        .find({})
        .sort({ createdAt: 1 })
        .limit(100)
        .toArray();

      ws.send(JSON.stringify({ type: "history", messages: history }));
    } catch (err) {
      console.error("Failed to send history:", err);
    }

    ws.on("message", async (msg) => {
      try {
        const parsed =
          typeof msg === "string"
            ? JSON.parse(msg)
            : JSON.parse(msg.toString());

        const messageToSave = {
          ...parsed,
          createdAt: new Date(),
        };

        await messagesCollection.insertOne(messageToSave);

        const broadcastData = JSON.stringify(messageToSave);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcastData);
          }
        });
      } catch (err) {
        console.error("Message processing error:", err);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });

    ws.on("error", (err) => {
      console.warn("WebSocket error:", err.message);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();