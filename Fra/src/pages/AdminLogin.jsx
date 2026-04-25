import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import StatusBlock from "../components/StatusBlock";
import "./dashboard/adminLayout.css";

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
      <h1>Acceso administrador</h1>
      <p style={{ color: "#5c6b7b" }}>
        Inicia sesión para gestionar productos y categorías.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <label className="adminField" htmlFor="login-usuario">
          <span>Usuario</span>
          <input
            id="login-usuario"
            className="adminInput"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu usuario"
            autoComplete="username"
            required
          />
        </label>
        <label className="adminField" htmlFor="login-password">
          <span>Contraseña</span>
          <input
            id="login-password"
            className="adminInput"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {err && <StatusBlock title="No se pudo iniciar sesión" message={err} tone="error" icon="!" />}

        <button
          type="submit"
          disabled={loading}
          className="adminPrimaryBtn"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
