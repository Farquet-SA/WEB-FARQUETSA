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

## Prioridad Media — Completadas

### 5. Eliminar `users.js` (código muerto)
**Archivos:** `Fra/src/api/users.js` (eliminado)

**Qué se hizo:**
- Confirmado que `users.js` no era importado por ningún componente.
- Llamaba a `/usuarios/` que no existe en el backend (el endpoint real es `/admins/`).
- Archivo eliminado.

---

### 6. Tokens en cookies HttpOnly + logout real con blacklist
**Archivos:** `BAC/backend/settings.py`, `BAC/catalogo/views.py`, `BAC/backend/urls.py`, `Fra/src/api/tokens.js`, `Fra/src/api/auth.js`, `Fra/src/api/axios.js`, `Fra/src/pages/dashboard/AdminLayout.jsx`

**Qué se hizo:**

**Backend:**
- `settings.py`: agregado `rest_framework_simplejwt.token_blacklist` a `INSTALLED_APPS`, `BLACKLIST_AFTER_ROTATION = True`, y `SIMPLE_JWT_REFRESH_COOKIE = "refresh_token"`.
- `views.py`: creadas tres nuevas vistas:
  - `CookieLoginView` (`POST /api/auth/login/`): valida credenciales, devuelve el access token en el body JSON y setea el refresh token como cookie `HttpOnly; Secure; SameSite=Strict` con `path=/api/auth/` para limitar su alcance.
  - `CookieRefreshView` (`POST /api/auth/refresh/`): lee el refresh de la cookie (no del body), devuelve nuevo access token y rota la cookie si `ROTATE_REFRESH_TOKENS=True`.
  - `LogoutView` (`POST /api/auth/logout/`): lee el refresh de la cookie, lo blacklista en la base de datos, y borra la cookie. El refresh queda inválido permanentemente.
- `urls.py`: reemplazados los endpoints SimpleJWT originales por las tres nuevas vistas.

> **Requiere migración de base de datos una sola vez:**
> ```bash
> python manage.py migrate
> ```

**Frontend:**
- `tokens.js`: eliminadas las funciones de refresh (`getRefresh`, `setTokens` con refresh). Ahora solo maneja el access token y los flags de sesión. Agregada `setAccess()` para mayor claridad.
- `auth.js`: login ya no guarda refresh en localStorage (el servidor lo setea como cookie). En error de `is_staff`, se llama al endpoint logout para invalidar la cookie recién creada. `logout()` ahora es `async` y llama `POST /auth/logout/` antes de limpiar localStorage.
- `axios.js`: agregado `withCredentials: true` al instance para que la cookie se envíe automáticamente. El interceptor de refresh ya no envía el token en el body — solo hace POST vacío y la cookie viaja sola.
- `AdminLayout.jsx`: `salir()` cambiado a `async` para `await logout()`.

**Resultado de seguridad:** Un refresh token robado del localStorage ya no es posible — solo existe en una cookie que JS no puede leer. El logout invalida el token en la base de datos, así que no puede ser reutilizado.

---

### 7. TanStack Query — setup e integración en AdminProductos
**Archivos:** `Fra/package.json`, `Fra/src/main.jsx`, `Fra/src/pages/dashboard/AdminProductos.jsx`

**Qué se hizo:**
- `package.json`: agregado `@tanstack/react-query: ^5.0.0` a dependencias.
- `main.jsx`: envuelto `<App />` con `<QueryClientProvider>`. `QueryClient` configurado con `staleTime: 30s` y `retry: 1`.
- `AdminProductos.jsx`: migrado de `useState + useEffect + loadData()` a TanStack Query:
  - `useQuery({ queryKey: ["productos"], queryFn: getProducts })` — reemplaza `useState([]) + useEffect + setProducts`.
  - `useQuery({ queryKey: ["categorias"], queryFn: getCategories })` — mismo patrón.
  - `handleSubmit` y `handleDelete`: reemplazan `await loadData()` por `await queryClient.invalidateQueries({ queryKey: ["productos"] })` — más eficiente (no recarga categorías innecesariamente).
  - Eliminados: `loading`, `setLoading`, la función `loadData`, y el `useEffect`.
- Las otras páginas del dashboard (`AdminCategorias`, `AdminServicios`, etc.) pueden migrarse progresivamente con el mismo patrón.

> **Requiere instalación de dependencias:**
> ```bash
> cd Fra && npm install
> ```

---

## Prioridad Baja — Completadas

### 8. TypeScript progresivo — Setup inicial + migración de capa API
**Archivos:** `Fra/tsconfig.json` (nuevo), `Fra/tsconfig.node.json` (nuevo), `Fra/src/vite-env.d.ts` (nuevo), `Fra/src/api/tokens.ts` (reemplaza `.js`), `Fra/src/api/auth.ts` (reemplaza `.js`), `Fra/src/api/axios.ts` (reemplaza `.js`)

**Qué se hizo:**

**Configuración TypeScript:**
- `tsconfig.json`: `strict: true`, `allowJs: true`, `checkJs: false`. Así los archivos `.ts` nuevos tienen tipo completo, y los `.jsx/.js` existentes siguen compilando sin errores hasta que se migren progresivamente. Se incluyen los mismos path aliases que Vite (`@`, `@api`, `@components`, etc.).
- `tsconfig.node.json`: configuración separada para `vite.config.js` (requerido por la referencia de proyecto).
- `vite-env.d.ts`: referencia `/// <reference types="vite/client" />` que habilita tipos para `import.meta.env.VITE_*`.

**Migración `tokens.ts`:**
- Tipos explícitos en todas las funciones (`string | null`, `string`, `void`).
- Constantes con `as const` para prevenir reasignación accidental.

**Migración `auth.ts`:**
- Interfaces exportadas `AdminUser` y `LoginResult` — definen el contrato entre el frontend y los endpoints `/auth/me/` y `/auth/login/`.
- Todos los parámetros y retornos tipados.

**Migración `axios.ts`:**
- Tipo `RetryableConfig` (extensión de `InternalAxiosRequestConfig`) para el flag interno `_retry` del interceptor de refresh.
- Cola `queue` tipada con `{ resolve, reject }` explícitos.
- `error` del interceptor casteado a tipo anónimo con los campos usados, evitando `any` generalizado.

**Qué falta para completar la migración (pasos siguientes):**
1. Migrar `Fra/src/api/*.js` restantes (`products`, `categories`, `servicios`, `admin`, `contacto`, `historial`)
2. Migrar componentes reutilizables (`ProductCard`, `CartDrawer`, `PrivateRoute`)
3. Migrar páginas del dashboard
4. Migrar test files (`.test.js` → `.test.ts`)

> Los archivos `.jsx` y los tests `.js` siguen funcionando sin cambios gracias a `allowJs: true`.

---

### 9. Sistema de toast centralizado (sonner)
**Archivos:** `Fra/package.json`, `Fra/src/App.jsx`, `Fra/src/pages/Contacto.jsx`, `Fra/src/pages/dashboard/AdminCategorias.jsx`, `Fra/src/pages/dashboard/AdminProductos.jsx`, `Fra/src/pages/dashboard/AdminServicios.jsx`, `Fra/src/pages/dashboard/AdminUsuarios.jsx`

**Qué se hizo:**

**Setup:**
- `package.json`: agregado `"sonner": "^1.4.0"` a dependencias.
- `App.jsx`: agregado `<Toaster position="top-right" richColors />` justo antes de cerrar `<BrowserRouter>`. Un solo punto de montaje para toda la app.

**Criterio aplicado:**
- **Errores de validación de formulario** → siguen como `setState` inline (persisten visibles hasta que el usuario corrija el campo).
- **Resultados de operaciones** (crear/actualizar/eliminar exitoso, errores de servidor) → `toast.success` / `toast.error` (se auto-descartan, no contaminan el formulario).

**`Contacto.jsx`:**
- Reemplazados los dos `alert()` (`alert(data.message)` y `alert("Error al enviar mensaje")`) por `toast.success(...)` y `toast.error(...)`.

**`AdminCategorias.jsx`:**
- Eliminado estado `success` y el div `{success && ...}` del JSX.
- Errores de carga y operaciones → `toast.error(...)`.
- Confirmaciones de CRUD → `toast.success(...)`.
- Agregado `try/catch` faltante en `handleDelete` (antes el error de red era silencioso).

**`AdminProductos.jsx`:**
- Eliminado estado `success` y su div del JSX.
- Éxito de crear/actualizar/eliminar → `toast.success(...)`.
- Error de eliminar → `toast.error(...)`.
- Errores de validación y de imagen (respuesta del servidor) siguen en `setError` inline.

**`AdminServicios.jsx`:**
- Eliminado estado `success` y su `<p>` del JSX.
- Todos los mensajes de éxito y errores de red → toast.

**`AdminUsuarios.jsx`:**
- Eliminado estado `success` y su div del JSX.
- Mensajes de éxito de CRUD → `toast.success(...)`.
- Errores de operación conservados en `setError` inline (contienen mensajes con contexto: sesión expirada, permisos insuficientes).

> **Requiere instalación de dependencias:**
> ```bash
> cd Fra && npm install
> ```

---

## Análisis de arquitectura de carpetas

### Estructura actual

```
WEB-FARQUETSA/
├── BAC/
│   ├── backend/          ← paquete de configuración Django (settings, urls, wsgi, asgi)
│   └── catalogo/         ← única app Django
│       ├── models.py
│       ├── views.py
│       ├── serializers.py
│       ├── permissions.py
│       ├── urls.py
│       ├── cloudinary_service.py
│       └── tests.py
├── Fra/
│   ├── src/
│   │   ├── api/          ← capa HTTP (un archivo por entidad)
│   │   ├── components/   ← componentes reutilizables
│   │   ├── context/      ← estado global
│   │   ├── layouts/      ← wrappers de layout
│   │   └── pages/
│   │       ├── *.jsx     ← páginas públicas
│   │       └── dashboard/← páginas del panel admin
│   ├── tsconfig.json     ← nuevo
│   └── vite.config.js
├── correccion.md
├── reglas.md
└── index.html            ← ⚠️ ver nota abajo
```

---

### Evaluación por capa

#### Backend (BAC/) — Bien estructurado para el tamaño actual

| Aspecto | Estado | Comentario |
|---|---|---|
| Separación config / lógica | ✅ | `backend/` para config, `catalogo/` para lógica de negocio |
| `cloudinary_service.py` separado | ✅ | Terceros encapsulados fuera de views |
| `permissions.py` separado | ✅ | Roles explícitos, no mezclados en views |
| Nombre del paquete config | ⚠️ | `backend/` es genérico — convención Django es usar el nombre del proyecto (ej. `farquetsa/`). Funciona pero puede confundir en equipos |
| Un solo app `catalogo` | ⚠️ | Con 8 modelos y vistas heterogéneas (productos, servicios, auth, contacto) ya empieza a mezclar responsabilidades. Si el proyecto crece, considerar split en `productos/`, `servicios/`, `auth/` |
| `tests.py` en la app | ✅ | Correcto para el tamaño actual |

#### Frontend (Fra/src/) — Bien estructurado, detalles menores

| Aspecto | Estado | Comentario |
|---|---|---|
| Separación api/components/context/layouts/pages | ✅ | Clara y consistente |
| Tests co-localizados | ✅ | `auth.test.js` junto a `auth.ts`, `CartContext.test.jsx` junto a `CartContext.jsx` — convención correcta |
| `pages/dashboard/` | ✅ | Apropiado para el tamaño del panel admin actual |
| CSS mixto | ⚠️ | Algunos componentes tienen su propio `.css` (navbar, historial, productCard), otros usan inline styles. No rompe nada, pero es inconsistente. Decisión: unificar en una dirección (CSS modules o todo inline) |
| Sin `src/types/` | ⚠️ | Necesario para centralizar las interfaces TypeScript a medida que la migración avance. Crear `Fra/src/types/api.ts` con `AdminUser`, `Producto`, `Categoria`, etc. |
| `App.css` | ⚠️ | Parece mínimo o vacío. Evaluar si puede fusionarse con `index.css` o eliminarse |

#### Raíz del repositorio — Un elemento a limpiar

| Aspecto | Estado | Comentario |
|---|---|---|
| `BAC/` y `Fra/` bien separados | ✅ | Monorepo con límites claros |
| `correccion.md` y `reglas.md` | ✅ | Documentación de arquitectura en la raíz |
| `index.html` en la raíz | ⚠️ | Es una copia del `Fra/index.html` (referencia a `/src/main.jsx` que no existe desde la raíz). Es un archivo residual de cuando la estructura era diferente. **Acción recomendada: eliminar** — no cumple ninguna función y puede confundir al abrirlo directamente |

---

### Veredicto general

La arquitectura está **bien dimensionada para el proyecto**. No hay sobre-ingeniería ni sub-estructura. Las tres mejoras reales pendientes son:

1. **Crear `Fra/src/types/`** cuando la migración TypeScript llegue a los componentes — un lugar central para las interfaces del API.
2. **Evaluar split de `catalogo/`** si se agregan más entidades al backend — actualmente mezcla autenticación, productos, servicios y contacto.
3. **Eliminar `index.html` de la raíz** — archivo residual sin función.
