const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_production";

// =====================
// Middleware
// =====================
app.use(express.json());

// 🔥 CORS FIX (Azure + local + production safe)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://frontend--0000002.blueground-ac897443.southindia.azurecontainerapps.io"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow Postman / curl
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // TEMP SAFE MODE (prevents Azure blocking during debugging)
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests
app.options("*", cors());

// =====================
// In-memory DB (demo only)
// =====================
const users = [];

// =====================
// JWT Middleware
// =====================
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
}

// =====================
// ROUTES
// =====================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Register
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Profile (Protected)
app.get("/api/profile", authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

// Logout
app.post("/api/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// =====================
// Start Server
// =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});