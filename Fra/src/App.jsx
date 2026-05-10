import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import SiteLayout from "./layouts/SiteLayout";

import Home from "./pages/Home";
import Productos from "./pages/ProductosPage";
import Servicios from "./pages/Servicios";
import Contacto from "./pages/Contacto";

import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";

// Admin
import PrivateRoute from "./components/PrivateRoute";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/dashboard/AdminLayout";
import AdminHome from "./pages/dashboard/AdminHome";
import AdminProductos from "./pages/dashboard/AdminProductos";
import AdminCategorias from "./pages/dashboard/AdminCategorias";
import AdminUsuarios from "./pages/dashboard/AdminUsuarios";
import AdminServicios from "./pages/dashboard/AdminServicios";
import Historial from "./pages/dashboard/Historial";
import SuperAdmin from "./pages/dashboard/SuperAdmin";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/contacto" element={<Contacto />} />
          </Route>

          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ================= ADMIN PROTEGIDO ================= */}
          <Route
            element={
              <PrivateRoute allowedRoles={["admin", "superadmin"]} />
            }
          >
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="productos" element={<AdminProductos />} />
              <Route path="categorias" element={<AdminCategorias />} />
              <Route path="servicios" element={<AdminServicios />} />

              <Route
                element={<PrivateRoute allowedRoles={["superadmin"]} />}
              >
                <Route path="historial" element={<Historial />} />
                <Route path="usuarios" element={<AdminUsuarios />} />
                <Route path="configuracion" element={<SuperAdmin />} />
              </Route>
            </Route>
          </Route>
        </Routes>

        <CartDrawer />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </CartProvider>
  );
}