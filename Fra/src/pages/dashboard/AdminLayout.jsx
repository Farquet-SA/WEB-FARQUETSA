import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { getRole, logout } from "../../api/auth";
import "./adminLayout.css";

export default function AdminLayout() {
  const role = getRole();
  const nav = useNavigate();

  const salir = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  return (
    <div className="adminWrap">
      <div className="adminHeader">
        <div className="adminHeaderInner">
          <div className="adminBrand">
            <img
              src="/logo-farquetsa.png"
              alt="Logo Farquetsa"
              className="adminBrandLogo"
            />
            <div>
              <div className="adminBrandName">Panel Admin</div>
              <div className="adminBrandSub">Farquetsa</div>
            </div>
          </div>

          <nav className="adminNav" aria-label="Navegación del panel administrativo">
            {role === "admin" && (
              <>
                <NavLink to="/admin" end className={({ isActive }) => `adminNavLink${isActive ? " active" : ""}`}>Inicio</NavLink>
                <NavLink to="/admin/productos" className={({ isActive }) => `adminNavLink${isActive ? " active" : ""}`}>Productos</NavLink>
                <NavLink to="/admin/categorias" className={({ isActive }) => `adminNavLink${isActive ? " active" : ""}`}>Categorías</NavLink>
                <NavLink to="/admin/servicios" className={({ isActive }) => `adminNavLink${isActive ? " active" : ""}`}>Servicios</NavLink>
              </>
            )}

            {role === "superadmin" && (
              <>
                <NavLink to="/admin" end className={({ isActive }) => `adminNavLink${isActive ? " active" : ""}`}>Inicio</NavLink>
                <NavLink to="/admin/historial" className={({ isActive }) => `adminNavLink${isActive ? " active" : ""}`}>Historial</NavLink>
                <NavLink to="/admin/productos" className={({ isActive }) => `adminNavLink${isActive ? " active" : ""}`}>Productos</NavLink>
                <NavLink to="/admin/categorias" className={({ isActive }) => `adminNavLink${isActive ? " active" : ""}`}>Categorías</NavLink>
                <NavLink to="/admin/servicios" className={({ isActive }) => `adminNavLink${isActive ? " active" : ""}`}>Servicios</NavLink>
                <NavLink to="/admin/usuarios" className={({ isActive }) => `adminNavLink${isActive ? " active" : ""}`}>Usuarios</NavLink>
              </>
            )}

            <button className="adminLogout" type="button" onClick={salir}>
              Cerrar sesión
            </button>
          </nav>
        </div>
      </div>

      <main className="adminMain">
        <Outlet />
      </main>
    </div>
  );
}
