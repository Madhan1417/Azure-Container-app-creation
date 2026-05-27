const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || "supersecret";

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
app.use(express.json());

app.use(
  cors({
    origin: [
      "https://aca-cookies-frontend--0000007.salmonmushroom-d1788df3.canadacentral.azurecontainerapps.io",
    ],
    credentials: true,
  })
);

// ─────────────────────────────────────────────
// DEMO DATABASE
// ─────────────────────────────────────────────
const users = [];

// ─────────────────────────────────────────────
// ROOT ROUTE
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "API is running 🚀",
    message: "Welcome to Azure Container Apps Backend Service",
  });
});

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "Backend running successfully 🚀",
    message: "Welcome to ACA Backend Health Endpoint",
  });
});

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
    };

    users.push(user);

    const token = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "User registered successfully 🚀",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
    });
  }
});

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful 🚀",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
    });
  }
});

// ─────────────────────────────────────────────
// AUTH MIDDLEWARE
// ─────────────────────────────────────────────
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid token",
    });
  }
}

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────
app.get("/api/profile", auth, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.json({
    message: "Profile fetched successfully 🚀",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});