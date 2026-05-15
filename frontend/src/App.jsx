import { useState, useContext, createContext } from "react";

// ─── API Base URL ─────────────────────────────────────────────────────────────
const API = "https://backend.blueground-ac897443.southindia.azurecontainerapps.io/api";

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) {}
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

// ─── API Helper ───────────────────────────────────────────────────────────────
async function apiCall(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    padding: "2rem",
  },
  card: {
    background: "#111118",
    border: "1px solid #1e1e2e",
    borderRadius: "20px",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
  },
  logo: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f1f1f5",
    margin: "0 0 0.4rem",
  },
  subtext: {
    fontSize: "14px",
    color: "#6b6b80",
    margin: "0 0 2rem",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#9898b0",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "#0d0d14",
    border: "1px solid #1e1e2e",
    borderRadius: "10px",
    color: "#f1f1f5",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "1rem",
    transition: "border-color 0.2s",
  },
  button: {
    width: "100%",
    padding: "11px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.5rem",
    transition: "opacity 0.2s",
  },
  error: {
    background: "#2a1515",
    border: "1px solid #4a2020",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#f87171",
    fontSize: "13px",
    marginBottom: "1rem",
  },
  success: {
    background: "#0f2a1a",
    border: "1px solid #1a4a2a",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#4ade80",
    fontSize: "13px",
    marginBottom: "1rem",
  },
  toggle: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "13px",
    color: "#6b6b80",
  },
  toggleLink: {
    color: "#818cf8",
    cursor: "pointer",
    fontWeight: "600",
    textDecoration: "none",
  },
  divider: {
    borderTop: "1px solid #1e1e2e",
    margin: "1.5rem 0",
  },
  dashboard: {
    minHeight: "100vh",
    background: "#0a0a0f",
    padding: "2rem",
    fontFamily: "'DM Sans', sans-serif",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "900px",
    margin: "0 auto 3rem",
  },
  navLogo: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#f1f1f5",
  },
  logoutBtn: {
    padding: "8px 16px",
    background: "transparent",
    border: "1px solid #1e1e2e",
    borderRadius: "8px",
    color: "#9898b0",
    fontSize: "13px",
    cursor: "pointer",
  },
  dashGrid: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "1.25rem",
  },
  dashCard: {
    background: "#111118",
    border: "1px solid #1e1e2e",
    borderRadius: "16px",
    padding: "1.5rem",
  },
  cardLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#6b6b80",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "0.75rem",
  },
  cardValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#f1f1f5",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#0f2a1a",
    border: "1px solid #1a4a2a",
    borderRadius: "20px",
    padding: "4px 12px",
    color: "#4ade80",
    fontSize: "12px",
    fontWeight: "600",
  },
};

// ─── Register Form ─────────────────────────────────────────────────────────────
function RegisterForm({ switchToLogin }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiCall("/register", "POST", form);
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
        <div style={styles.logo}>⚡</div>
        <h1 style={styles.heading}>Create account</h1>
        <p style={styles.subtext}>Start your journey today</p>

        {error && <div style={styles.error}>⚠ {error}</div>}

        <label style={styles.label}>Full name</label>
        <input
          style={styles.input}
          placeholder="John Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label style={styles.label}>Email address</label>
        <input
          style={styles.input}
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label style={styles.label}>Password</label>
        <input
          style={styles.input}
          type="password"
          placeholder="Min. 6 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <button
          style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account →"}
        </button>

        <div style={styles.toggle}>
          Already have an account?{" "}
          <span style={styles.toggleLink} onClick={switchToLogin}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

// ─── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ switchToRegister }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiCall("/login", "POST", form);
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
        <div style={styles.logo}>⚡</div>
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subtext}>Sign in to your account</p>

        {error && <div style={styles.error}>⚠ {error}</div>}

        <label style={styles.label}>Email address</label>
        <input
          style={styles.input}
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label style={styles.label}>Password</label>
        <input
          style={styles.input}
          type="password"
          placeholder="Your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <button
          style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <div style={styles.toggle}>
          No account yet?{" "}
          <span style={styles.toggleLink} onClick={switchToRegister}>Create one</span>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard (Protected) ─────────────────────────────────────────────────────
function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setMsg("");
    try {
      const data = await apiCall("/profile");
      setProfile(data.user);
      setMsg("✓ Profile fetched from backend!");
    } catch (err) {
      setMsg("✗ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.nav}>
        <span style={styles.navLogo}>⚡ AuthApp</span>
        <button style={styles.logoutBtn} onClick={logout}>
          Sign out
        </button>
      </div>

      <div style={styles.dashGrid}>
        <div style={styles.dashCard}>
          <div style={styles.cardLabel}>Logged in as</div>
          <div style={styles.cardValue}>{user.name}</div>
          <div style={{ marginTop: "8px", color: "#6b6b80", fontSize: "13px" }}>
            {user.email}
          </div>
        </div>

        <div style={styles.dashCard}>
          <div style={styles.cardLabel}>Auth Status</div>
          <div style={styles.badge}>● Active session</div>
          <div style={{ marginTop: "10px", color: "#6b6b80", fontSize: "13px" }}>
            JWT stored in localStorage
          </div>
        </div>

        <div style={styles.dashCard}>
          <div style={styles.cardLabel}>Test Protected Route</div>
          <div style={{ color: "#9898b0", fontSize: "13px", marginBottom: "1rem" }}>
            Fetch your profile from the backend using the JWT token.
          </div>
          <button
            style={{ ...styles.button, marginTop: 0, opacity: loading ? 0.7 : 1 }}
            onClick={fetchProfile}
            disabled={loading}
          >
            {loading ? "Fetching..." : "GET /api/profile"}
          </button>
          {msg && (
            <div
              style={{
                ...(msg.startsWith("✓") ? styles.success : styles.error),
                marginTop: "0.75rem",
                marginBottom: 0,
              }}
            >
              {msg}
            </div>
          )}
          {profile && (
            <pre
              style={{
                marginTop: "0.75rem",
                background: "#0d0d14",
                borderRadius: "8px",
                padding: "12px",
                color: "#a5b4fc",
                fontSize: "12px",
                overflow: "auto",
              }}
            >
              {JSON.stringify(profile, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
function AuthPages() {
  const [page, setPage] = useState("login");
  return page === "login"
    ? <LoginForm switchToRegister={() => setPage("register")} />
    : <RegisterForm switchToLogin={() => setPage("login")} />;
}

// ─── Root App ─────────────────────────────────────────────────────────────────
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