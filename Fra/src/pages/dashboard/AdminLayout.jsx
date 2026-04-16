import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { getRole, logout } from "../../api/auth";

export default function AdminLayout() {
  const role = getRole();
  const nav = useNavigate();

  const salir = () => {
    logout();
    nav("/login", { replace: true });
  };

  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 800,
    color: isActive ? "#0b2b4b" : "#5c6b7b",
    background: isActive ? "#eaf2ff" : "transparent",
    border: isActive ? "1px solid #dbe7f7" : "1px solid transparent",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f7fbff" }}>
      <div
        style={{
          borderBottom: "1px solid #e5edf7",
          background: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 14,
                background: "#0b2b4b",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
              }}
            >
              F
            </div>
            <div>
              <div style={{ fontWeight: 900, color: "#0b2b4b" }}>
                Panel Admin
              </div>
              <div style={{ fontSize: 12, color: "#5c6b7b" }}>Farquetsa</div>
            </div>
          </div>

          <nav style={{ display: "flex", gap: 10, alignItems: "center" }}>

            {role === "admin" && (
              <>
                <NavLink to="/admin" end style={linkStyle}>Inicio</NavLink>
                <NavLink to="/admin/productos" style={linkStyle}>Productos</NavLink>
                <NavLink to="/admin/categorias" style={linkStyle}>Categorías</NavLink>
                <NavLink to="/admin/servicios" style={linkStyle}>Servicios</NavLink>
                <NavLink to="/admin/historial" style={linkStyle}>Historial</NavLink>
              </>
            )}

            {role === "superadmin" && (
              <><NavLink to="/admin" end style={linkStyle}>
                Inicio
              </NavLink>
              <NavLink to="/admin/historial" style={linkStyle}>
                  Historial
              </NavLink>
              <NavLink to="/admin/productos" style={linkStyle}>
                  Productos
              </NavLink>
              <NavLink to="/admin/categorias" style={linkStyle}>
                  Categorías
              </NavLink>
              <NavLink to="/admin/usuarios" style={linkStyle}>
                Usuarios
              </NavLink></>
            )}

            <button
              onClick={salir}
              style={{
                marginLeft: 10,
                height: 40,
                padding: "0 14px",
                borderRadius: 12,
                border: "1px solid #dbe7f7",
                background: "#fff",
                fontWeight: 900,
                cursor: "pointer",
                color: "#0b2b4b",
              }}
            >
              Cerrar sesion
            </button>
          </nav>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 18px" }}>
        <Outlet />
      </main>
    </div>
  );
}
