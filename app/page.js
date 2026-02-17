"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000/ws");

    ws.onopen = () => console.log("Connected to WebSocket server");
    ws.onerror = (err) => console.error("WebSocket error (ignored in dev):", err.message);
    ws.onmessage = (event) => setMessages((prev) => [...prev, event.data]);

    setSocket(ws);

    return () => ws.close();
  }, []);

  const sendMessage = () => {
    if (!socket || !username || !message) return;

    socket.send(`${username}: ${message}`);
    setMessage("");
  };

  return (
    <div style={{ margin: "0 auto",color: "#000", backgroundColor: "#fff", minHeight: "100vh" }}>

      <input
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <div style={{padding: 10, height: "100%", overflowY: "auto" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {messages.map((msg, i) => (
            <li key={i} style={{ marginBottom: 5 }}>{msg}</li>
          ))}
        </ul>
      </div>

      <div style={{position: "fixed", bottom: "0", display: "flex", marginBottom: 10, colour: "#000" }}>
        <input
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={sendMessage} style={{ padding: "8px 16px", marginLeft: 5 }}>Send</button>
      </div>

    </div>
  );
}
