import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function AdminLogin() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(username, password);
      nav("/admin", { replace: true });
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setErr(detail || error.message || "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "60px 18px" }}>
      <h1>Acceso Administrador</h1>
      <p style={{ color: "#5c6b7b" }}>
        Inicia sesión para gestionar productos y categorías.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuario"
          autoComplete="username"
          required
          style={{ padding: 12, borderRadius: 12, border: "1px solid #e5edf7" }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          type="password"
          autoComplete="current-password"
          required
          style={{ padding: 12, borderRadius: 12, border: "1px solid #e5edf7" }}
        />

        {err && <div style={{ color: "#b42318", fontWeight: 700 }}>{err}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            height: 44,
            borderRadius: 12,
            border: "1px solid #dbe7f7",
            background: "#0b2b4b",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
