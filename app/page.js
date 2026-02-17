"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000/ws");

    ws.onopen = () => console.log("Connected to WebSocket server");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    ws.onerror = (err) =>
      console.error("WebSocket error (ignored in dev):", err.message);

    setSocket(ws);

    return () => ws.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!socket || !username.trim() || !message.trim()) return;

    const payload = {
      type: "chat_message",
      username,
      message,
      date: new Date().toISOString(),
    };
    
    socket.send(JSON.stringify(payload));
    setMessage("");
  };

  return (
    <div
      style={{
        margin: "0 auto",
        color: "#000",
        backgroundColor: "#ccc",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 10 }}>
        <input
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 10,
        }}
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {messages.map((msg, i) => {
            const isMe = msg.username === username;
            const formattedDate = new Date(msg.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

            return (
              <li
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMe ? "flex-end" : "flex-start",
                    maxWidth: "60%",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 13,
                      marginBottom: 4,
                      paddingRight: isMe ? 4 : 0,
                      paddingLeft: isMe ? 0 : 4
                    }}
                  >
                    {msg.username}
                  </div>

                  <div
                    style={{
                      backgroundColor: isMe ? "#37997a" : "#eee",
                      color: isMe ? "#fff" : "#000",
                      padding: "8px 12px",
                      borderRadius: 16,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.message}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      marginTop: 4,
                      opacity: 0.7,
                      paddingRight: isMe ? 4 : 0,
                      paddingLeft: isMe ? 0 : 4
                    }}
                  >
                    {formattedDate}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          padding: 10,
          backgroundColor: "#ccc",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: 6,
            borderRadius: 30,
            backgroundColor: "#eee",
          }}
        >
          <input
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            style={{
              flex: 1,
              padding: 8,
              paddingLeft: 16,
              outline: "none",
              border: "none",
              background: "transparent",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: "8px 16px",
              marginLeft: 5,
              cursor: "pointer",
              backgroundColor: "#37997a",
              color: "#fff",
              borderRadius: 50,
              border: "none",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
