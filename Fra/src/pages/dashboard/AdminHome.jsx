import { useCallback, useEffect, useState } from "react";
import { getRole } from "../../api/auth";
import { getProducts } from "../../api/products";
import { getCategories } from "../../api/categories";
import { getAdmins } from "../../api/admin";
import StatusBlock from "../../components/StatusBlock";

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
    <div className="adminPage">
      <section className="adminPanel">
        <p className="adminEyebrow">Panel de control</p>
        <h1 className="adminTitle">
          Bienvenido, {role === "superadmin" ? "Superadmin" : "Administrador"}
        </h1>
        <p className="adminSub">
          Gestiona el catálogo de productos, categorías y{" "}
          {role === "superadmin" ? "usuarios" : "contenido"} de Farquetsa.
        </p>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHead">
          <div>
            <p className="adminEyebrow">Resumen</p>
            <h2 className="adminTitle">Estadísticas rápidas</h2>
            <p className="adminSub">Lectura actual del catálogo y la administración.</p>
          </div>
        </div>

        {loading ? (
          <StatusBlock
            title="Cargando estadísticas"
            message="Estamos consultando la información más reciente del sistema."
            tone="loading"
            icon="..."
          />
        ) : (
          <div className="adminStatsGrid">
            <div className="adminStatCard">
              <div className="adminStatNumber">{stats.products}</div>
              <div className="adminStatLabel">Productos</div>
            </div>
            <div className="adminStatCard">
              <div className="adminStatNumber">{stats.categories}</div>
              <div className="adminStatLabel">Categorías</div>
            </div>
            {role === "superadmin" && (
              <div className="adminStatCard">
                <div className="adminStatNumber">{stats.users}</div>
                <div className="adminStatLabel">Usuarios</div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="adminPanel flat">
        <p className="adminEyebrow">Operación</p>
        <h2 className="adminTitle">Acciones rápidas</h2>
        <p className="adminSub">Entra directo a las secciones principales del panel.</p>

        <div className="adminActionsGrid">
          <a href="/admin/productos" className="adminAction">
            Productos
          </a>
          <a href="/admin/categorias" className="adminAction">
            Categorías
          </a>
          {role === "superadmin" && (
            <a href="/admin/usuarios" className="adminAction">
              Usuarios
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
