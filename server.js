require("dotenv").config();
const { createServer } = require("http");
const next = require("next");
const WebSocket = require("ws");
const { MongoClient } = require("mongodb");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let messagesCollection;
let usersCollection;

app.prepare().then(async () => {
  await client.connect();
  console.log("Connected to DataBase");

  const db = client.db("chat_app");
  messagesCollection = db.collection("messages");
  usersCollection = db.collection("users");

  const server = createServer((req, res) => {
    if (req.url === "/api/login" && req.method === "POST") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        const { username, password } = JSON.parse(body);

        const user = await usersCollection.findOne({ username });

        if (!user) {
          res.writeHead(401, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "User not found" }));
        }

        if (user.password !== password) {
          res.writeHead(401, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Wrong password" }));
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      });

      return;
    }

    if (req.url === "/api/signup" && req.method === "POST") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        const { username, password } = JSON.parse(body);

        const existing = await usersCollection.findOne({ username });

        if (existing) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "User already exists" }));
        }

        await usersCollection.insertOne({
          username,
          password, // plaintext for arty to encrypt
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      });

      return;
    }

    handle(req, res);
  });

  const wss = new WebSocket.Server({ noServer: true, path: "/ws" });

  server.on("upgrade", (request, socket, head) => {
    if (request.url === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", async (ws) => {
    console.log("Client connected");

    try {
      const history = await messagesCollection
        .find()
        .sort({ date: 1 })
        .limit(50)
        .toArray();

      ws.send(JSON.stringify({ type: "history", messages: history }));
    } catch (err) {
      console.error("Failed to load history:", err);
    }

    ws.on("message", async (msg) => {
      let messageObj;

      try {
        const jsonString =
          msg instanceof Buffer ? msg.toString("utf-8") : msg;
        messageObj = JSON.parse(jsonString);
      } catch (err) {
        console.error("Invalid message:", err);
        return;
      }

      console.log("Received:", messageObj);

      try {
        await messagesCollection.insertOne(messageObj);
      } catch (err) {
        console.error("DB save error:", err);
      }

      const data = JSON.stringify(messageObj);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    });

    ws.on("close", () => console.log("Client disconnected"));
    ws.on("error", (err) =>
      console.warn("WebSocket error:", err.message)
    );
  });

  server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});