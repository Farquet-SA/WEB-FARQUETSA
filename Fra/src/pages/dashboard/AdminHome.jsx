import { useCallback, useEffect, useState } from "react";
import { getRole } from "../../api/auth";
import { getProducts } from "../../api/products";
import { getCategories } from "../../api/categories";
import { getAdmins } from "../../api/admin";

export default function AdminHome() {
  const role = getRole();
  const [stats, setStats] = useState({ products: 0, categories: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      const productsCount = Array.isArray(productsRes)
        ? productsRes.length
        : productsRes?.count || 0;
      const categoriesCount = Array.isArray(categoriesRes)
        ? categoriesRes.length
        : categoriesRes?.count || 0;

      let usersCount = 0;
      if (role === "superadmin") {
        try {
          const usersRes = await getAdmins();
          usersCount = Array.isArray(usersRes)
            ? usersRes.length
            : usersRes?.count || 0;
        } catch {
          usersCount = 0;
        }
      }

      setStats({
        products: productsCount,
        categories: categoriesCount,
        users: usersCount,
      });
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Bienvenida */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5edf7",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 8px 18px rgba(2, 32, 71, 0.06)",
        }}
      >
        <h1 style={{ margin: 0, color: "#0b2b4b" }}>
          Bienvenido, {role === "superadmin" ? "Superadmin" : "Administrador"}
        </h1>
        <p style={{ color: "#5c6b7b", marginTop: 8 }}>
          Gestiona el catálogo de productos, categorías y{" "}
          {role === "superadmin" ? "usuarios" : "contenido"} de Rayito Pharmacy.
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5edf7",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 8px 18px rgba(2, 32, 71, 0.06)",
        }}
      >
        <h2 style={{ margin: 0, color: "#0b2b4b", fontSize: 30 }}>
          Estadísticas rápidas
        </h2>
        <p style={{ color: "#5c6b7b", marginTop: 8 }}>
          Resumen actual del sistema.
        </p>

        {loading ? (
          <div style={{ color: "#5c6b7b", marginTop: 12 }}>
            Cargando estadísticas...
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 12,
              marginTop: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            }}
          >
            <div style={statCardStyle}>
              <div style={statNumberStyle}>{stats.products}</div>
              <div style={statLabelStyle}>Productos</div>
            </div>
            <div style={statCardStyle}>
              <div style={statNumberStyle}>{stats.categories}</div>
              <div style={statLabelStyle}>Categorías</div>
            </div>
            {role === "superadmin" && (
              <div style={statCardStyle}>
                <div style={statNumberStyle}>{stats.users}</div>
                <div style={statLabelStyle}>Usuarios</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5edf7",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 8px 18px rgba(2, 32, 71, 0.06)",
        }}
      >
        <h2 style={{ margin: 0, color: "#0b2b4b", fontSize: 30 }}>
          Acciones rápidas
        </h2>
        <p style={{ color: "#5c6b7b", marginTop: 8 }}>
          Navega directamente a las secciones principales.
        </p>

        <div
          style={{
            display: "grid",
            gap: 12,
            marginTop: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          <a href="/admin/productos" style={actionLinkStyle}>
            <div style={actionCardStyle}>📦 Gestionar Productos</div>
          </a>
          <a href="/admin/categorias" style={actionLinkStyle}>
            <div style={actionCardStyle}>📂 Gestionar Categorías</div>
          </a>
          {role === "superadmin" && (
            <a href="/admin/usuarios" style={actionLinkStyle}>
              <div style={actionCardStyle}>👥 Gestionar Usuarios</div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Estilos
const statCardStyle = {
  background: "#f7fbff",
  border: "1px solid #e5edf7",
  borderRadius: 12,
  padding: 16,
  textAlign: "center",
};

const statNumberStyle = {
  fontSize: 32,
  fontWeight: 900,
  color: "#0b2b4b",
};

const statLabelStyle = {
  fontSize: 14,
  color: "#5c6b7b",
  marginTop: 4,
};

const actionLinkStyle = {
  textDecoration: "none",
  color: "inherit",
};

const actionCardStyle = {
  background: "#eaf2ff",
  border: "1px solid #dbe7f7",
  borderRadius: 12,
  padding: 16,
  textAlign: "center",
  fontWeight: 700,
  color: "#0b2b4b",
  cursor: "pointer",
  transition: "background 0.2s",
};
