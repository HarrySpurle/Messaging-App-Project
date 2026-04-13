"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (!username.trim()) return;

    // Save username locally (simple auth for now)
    localStorage.setItem("username", username);

    // Redirect to chat
    router.push("/");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#ccc",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 30,
          borderRadius: 10,
          width: 300,
        }}
      >
        <h2>Login</h2>

        <input
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 10,
            background: "#37997a",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Enter Chat
        </button>
      </div>
    </div>
  );
}