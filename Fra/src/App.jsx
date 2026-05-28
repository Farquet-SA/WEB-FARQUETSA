import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import SiteLayout from "./layouts/SiteLayout";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./components/NotFound";

import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";

// Admin
import PrivateRoute from "./components/PrivateRoute";

const Home = lazy(() => import("./pages/Home"));
const Productos = lazy(() => import("./pages/ProductosPage"));
const Servicios = lazy(() => import("./pages/Servicios"));
const Contacto = lazy(() => import("./pages/Contacto"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/dashboard/AdminLayout"));
const AdminHome = lazy(() => import("./pages/dashboard/AdminHome"));
const AdminProductos = lazy(() => import("./pages/dashboard/AdminProductos"));
const AdminCategorias = lazy(() => import("./pages/dashboard/AdminCategorias"));
const AdminUsuarios = lazy(() => import("./pages/dashboard/AdminUsuarios"));
const AdminServicios = lazy(() => import("./pages/dashboard/AdminServicios"));
const Historial = lazy(() => import("./pages/dashboard/Historial"));
const SuperAdmin = lazy(() => import("./pages/dashboard/SuperAdmin"));

function PageFallback() {
  return (
    <div className="pageFallback" aria-live="polite">
      Cargando...
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ================= ADMIN PROTEGIDO ================= */}
            <Route
              element={<PrivateRoute allowedRoles={["admin", "superadmin"]} />}
            >
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminHome />} />
                <Route path="productos" element={<AdminProductos />} />
                <Route path="categorias" element={<AdminCategorias />} />
                <Route path="servicios" element={<AdminServicios />} />

                <Route element={<PrivateRoute allowedRoles={["superadmin"]} />}>
                  <Route path="historial" element={<Historial />} />
                  <Route path="usuarios" element={<AdminUsuarios />} />
                  <Route path="configuracion" element={<SuperAdmin />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Suspense>

        <CartDrawer />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </CartProvider>
  );
}
