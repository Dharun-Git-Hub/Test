import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  // 🔹 Login handler
  const handleLogin = async () => {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 🔑 Include cookies
      body: JSON.stringify({ username: "john", password: "1234" }),
    });
    const data = await res.json();
    setMessage(data.message);
  };

  // 🔹 Get protected data
  const getProtected = async () => {
    const res = await fetch("http://localhost:3000/protected", {
      credentials: "include", // 🔑 Include cookie automatically
    });
    const data = await res.json();
    setMessage(JSON.stringify(data, null, 2));
  };

  // 🔹 Logout
  const handleLogout = async () => {
    const res = await fetch("http://localhost:3000/logout", {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Secure JWT Auth (React + Node)</h2>

      <button onClick={handleLogin}>Login</button>
      <button onClick={getProtected} style={{ marginLeft: "1rem" }}>Get Protected Data</button>
      <button onClick={handleLogout} style={{ marginLeft: "1rem" }}>Logout</button>

      <pre style={{ marginTop: "1rem", background: "#f5f5f5", padding: "1rem" }}>
        {message}
      </pre>
    </div>
  );
}

export default App;
