import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

// ✅ Allow React frontend to send cookies
app.use(cors({
  origin: "http://localhost:5173", // your React app URL (Vite default)
  credentials: true,
}));

const SECRET_KEY = process.env.JWT_SECRET || "my_secret_key";

// 🔹 Login route — generates JWT and sets it in HttpOnly cookie
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple demo authentication
  if (username !== "john" || password !== "1234") {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = { id: 1, username };
  const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });

  res.cookie("authToken", token, {
    httpOnly: true,
    secure: false, // set to true if using HTTPS
    sameSite: "Lax",
    maxAge: 60 * 60 * 1000,
  });

  res.json({ message: "Login successful" });
});

// 🔹 Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.cookies.authToken;
  if (!token) return res.status(401).json({ message: "No token" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// 🔹 Protected route
app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}`, user: req.user });
});

// 🔹 Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.json({ message: "Logged out successfully" });
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
                     
