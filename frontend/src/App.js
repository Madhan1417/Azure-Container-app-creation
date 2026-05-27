import { useState, useContext, createContext } from "react";

// ─────────────────────────────────────────────
// API BASE URL
// ─────────────────────────────────────────────
const API =
  "https://aca-cookies-backend--0000005.salmonmushroom-d1788df3.canadacentral.azurecontainerapps.io";

// ─────────────────────────────────────────────
// AUTH CONTEXT
// ─────────────────────────────────────────────
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// ─────────────────────────────────────────────
// API HELPER
// ─────────────────────────────────────────────
async function apiCall(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// ─────────────────────────────────────────────
// REGISTER FORM
// ─────────────────────────────────────────────
function RegisterForm({ switchToLogin }) {
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await apiCall(
        "/api/register",
        "POST",
        form
      );

      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.mainHeading}>
          Welcome to ACA Auth Portal 🚀
        </h1>

        <h2 style={styles.heading}>Create Account</h2>

        {error && <div style={styles.error}>{error}</div>}

        <input
          placeholder="Enter your name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          style={styles.input}
        />

        <input
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          style={styles.input}
        />

        <input
          placeholder="Enter your password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          style={styles.input}
        />

        <button
          onClick={handleSubmit}
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p style={styles.link} onClick={switchToLogin}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGIN FORM
// ─────────────────────────────────────────────
function LoginForm({ switchToRegister }) {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await apiCall(
        "/api/login",
        "POST",
        form
      );

      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.mainHeading}>
          Welcome to ACA Auth Portal 🚀
        </h1>

        <h2 style={styles.heading}>Login</h2>

        {error && <div style={styles.error}>{error}</div>}

        <input
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          style={styles.input}
        />

        <input
          placeholder="Enter your password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          style={styles.input}
        />

        <button
          onClick={handleSubmit}
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Signing In..." : "Login"}
        </button>

        <p style={styles.link} onClick={switchToRegister}>
          Create new account
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
function Dashboard() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    try {
      const data = await apiCall("/api/profile");

      setProfile(data.user);

      setMessage(
        "Profile loaded successfully from backend 🚀"
      );
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Welcome {user.name} 🚀</h2>

        <p>{user.email}</p>

        <p>
          Successfully authenticated using Azure
          Container Apps
        </p>

        <button style={styles.button} onClick={logout}>
          Logout
        </button>

        <hr />

        <button
          style={styles.button}
          onClick={fetchProfile}
        >
          Fetch Profile API
        </button>

        {message && <p>{message}</p>}

        {profile && (
          <pre style={{ textAlign: "left" }}>
            {JSON.stringify(profile, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────
function AuthPages() {
  const [page, setPage] = useState("login");

  return page === "login" ? (
    <LoginForm
      switchToRegister={() => setPage("register")}
    />
  ) : (
    <RegisterForm
      switchToLogin={() => setPage("login")}
    />
  );
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();

  return user ? <Dashboard /> : <AuthPages />;
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f0f0f",
    color: "#ffffff",
  },

  card: {
    width: "350px",
    padding: "25px",
    background: "#1c1c1c",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  mainHeading: {
    fontSize: "22px",
    textAlign: "center",
    marginBottom: "10px",
  },

  heading: {
    margin: 0,
    textAlign: "center",
  },

  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "none",
  },

  button: {
    padding: "12px",
    background: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  error: {
    color: "#ff4d4f",
    fontSize: "13px",
  },

  link: {
    color: "#60a5fa",
    cursor: "pointer",
    fontSize: "13px",
    textAlign: "center",
  },
};