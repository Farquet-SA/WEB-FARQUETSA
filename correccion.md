# Registro de Correcciones

---

## Prioridad Alta — Completadas

### 1. Backend: Permisos globales cambiados a `IsAuthenticated`
**Archivos:** `BAC/backend/settings.py`, `BAC/catalogo/views.py`

**Qué se hizo:**
- `settings.py`: `DEFAULT_PERMISSION_CLASSES` cambió de `AllowAny` → `IsAuthenticated`. Ahora cualquier endpoint sin permiso explícito exige autenticación en lugar de ser público por defecto.
- `views.py` — Se auditaron todas las vistas. Hallazgos:
  - `CategoriaViewSet`, `ProductoViewSet`, `ImagenInformacionViewSet`: ya tenían `get_permissions()` correcto (GET público, escritura solo admin). ✅ Sin cambio.
  - `CurrentUserView`, `ProductImageUploadView`, `AdminViewSet`, `historial_list`, `configuracion_limpieza`: ya tenían permisos explícitos. ✅ Sin cambio.
  - `ContactoView`: no tenía `permission_classes` → **agregado** `permission_classes = [AllowAny]` (el formulario de contacto debe ser público).
  - `ServicioViewSet`, `PasoProcesoViewSet`, `ConfianzaViewSet`: no tenían permisos → **agregado** `get_permissions()` en cada uno (GET público, escritura solo admin).

---

### 2. Frontend: Acceso a tokens centralizado en `tokens.js`
**Archivos:** `Fra/src/api/tokens.js` (nuevo), `Fra/src/api/auth.js`, `Fra/src/api/axios.js`

**Qué se hizo:**
- Creado `tokens.js`: módulo único que define las claves de localStorage y exporta `getAccess`, `getRefresh`, `setTokens`, `clearTokens`. No importa nada de axios ni de auth (sin dependencias circulares).
- `auth.js`: ya tenía sus propias constantes. Ahora las importa desde `tokens.js`. También usa `getAccess()` en lugar de `localStorage.getItem` directo. `logout()` delega a `clearTokens()`.
- `axios.js`: reemplazados los strings literales `"access"`, `"refresh"` y las funciones locales duplicadas por importaciones de `tokens.js`.
- Resultado: ningún archivo fuera de `tokens.js` toca `localStorage` para tokens. Cambiar la estrategia de almacenamiento (ej. cookies) requiere editar un solo archivo.

---

### 3. Variables de entorno de producción
**Archivos:** `Fra/.env.production` (nuevo), `BAC/.env.example` (nuevo)

**Qué se hizo:**
- `Fra/.env.production`: creado con `VITE_API_URL=https://tu-backend-produccion.com/api`. Reemplazar la URL con la real antes del primer deploy.
- `BAC/.env.example`: creado como plantilla completa con todas las variables necesarias para el backend en producción: `DJANGO_SECRET_KEY`, `DATABASE_URL`, credenciales Cloudinary, configuración SMTP, CORS, SSL. Copiar a `BAC/.env` y rellenar los valores reales.

---

### 4. Tests básicos configurados
**Archivos:** `Fra/vite.config.js`, `Fra/package.json`, `Fra/src/test-setup.js` (nuevo), `Fra/src/api/auth.test.js` (nuevo), `Fra/src/context/CartContext.test.jsx` (nuevo), `BAC/catalogo/tests.py`

**Qué se hizo:**

**Frontend (Vitest):**
- `vite.config.js`: agregada sección `test` con `environment: 'jsdom'` y `globals: true`.
- `package.json`: agregados scripts `"test": "vitest"` y `"test:run": "vitest run"`.
- `src/test-setup.js`: setup global que importa `@testing-library/jest-dom`.
- `auth.test.js`: 6 tests cubriendo `isTokenValid` (sin token / token válido / token expirado), `isAuthed` (sin token / sin flag / con flag), `getRole`.
- `CartContext.test.jsx`: 5 tests cubriendo `addItem` (nuevo / acumulación), `removeItem`, `clear`, persistencia en localStorage, cálculo de subtotal.

**Backend (Django test runner nativo):**
- `tests.py`: ya tenía tests de productos. Se extendió con:
  - `ServiciosPermissionsTests`: verifica que GET de servicios es público (200), POST anónimo da 401, POST con admin da 201, DELETE anónimo da 401.
  - `ContactoViewTests`: verifica que POST a `/api/contacto/` es público (200) y que `send_mail` se invoca.

**Comandos para instalar dependencias de test:**
```bash
# Frontend (dentro de Fra/)
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Backend — ya usa el test runner nativo de Django, no requiere instalación extra
# Correr con:
python manage.py test catalogo
```

---

## Prioridad Media — Pendientes

- [ ] Habilitar blacklist de refresh tokens (logout real)
- [ ] Eliminar `Fra/src/api/users.js` (código muerto — endpoint `/usuarios/` no existe en el backend)
- [ ] TanStack Query para estado de servidor
- [ ] Tokens en cookies HttpOnly (requiere cambio de backend)

## Prioridad Baja — Pendientes

- [ ] TypeScript progresivo
- [ ] Sistema de toast centralizado (sonner / react-hot-toast)
