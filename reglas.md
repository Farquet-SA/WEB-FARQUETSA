# Análisis de Arquitectura — Rayito Pharmacy (Full-Stack)

Fecha: 2026-04-16 (revisado con acceso a BAC/ y Fra/ completos)

---

## Stack actual

### Frontend (Fra/)

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | React (JSX) | 19.2.0 |
| Build | Vite (rolldown) | 7.2.5 |
| Routing | React Router DOM | 7.13.0 |
| HTTP | Axios con interceptores JWT | 1.13.4 |
| Estado global | Context API + localStorage | nativo |
| PDF | jsPDF + jspdf-autotable | 4.2.1 / 5.0.7 |
| Estilos | CSS plano por componente | — |
| Tipos | Sin TypeScript | — |
| Tests | Sin configurar | — |

### Backend (BAC/)

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Django | 6.0.1 |
| API | Django REST Framework | 3.16.1 |
| Auth | SimpleJWT | 5.5.1 |
| CORS | django-cors-headers | 4.9.0 |
| DB producción | PostgreSQL (psycopg3) | — |
| DB desarrollo | SQLite (fallback) | — |
| Imágenes | Cloudinary | 1.44.1 |
| Email | SMTP (Gmail por defecto) | — |
| Tests | Sin configurar | — |

---

## Estructura de carpetas

### Frontend

```
Fra/src/
├── api/           # Capa HTTP (un archivo por entidad)
├── components/    # Componentes reutilizables
├── context/       # Estado global (CartContext)
├── layouts/       # Wrappers de layout (SiteLayout, AdminLayout)
├── pages/
│   ├── *.jsx      # Páginas públicas (Home, Productos, Servicios, Contacto)
│   └── dashboard/ # Páginas del panel admin
├── App.jsx        # Router raíz
└── main.jsx       # Entry point
```

### Backend

```
BAC/
├── backend/       # Configuración Django (settings, urls, wsgi)
└── catalogo/      # App principal
    ├── models.py         # Entidades: Producto, Categoria, Servicio,
    │                     #   PasoProceso, Confianza, ImagenInformacion,
    │                     #   Historial, ConfiguracionSistema
    ├── views.py          # ViewSets y APIViews
    ├── serializers.py    # Serializers DRF con validación
    ├── permissions.py    # IsSuperAdmin, IsAdmin personalizados
    ├── urls.py           # Rutas de API
    └── cloudinary_service.py
```

---

## Lo que está bien

### Frontend

#### Capa API limpia y separada
Cada entidad tiene su módulo en `src/api/`: `auth.js`, `products.js`, `categories.js`, `servicios.js`, `admin.js`, `contacto.js`, `historial.js`.
Las páginas nunca hacen `fetch` directamente. Cambiar el backend no implica tocar componentes.

#### Interceptores de Axios con refresh automático
`src/api/axios.js` implementa una cola de peticiones para evitar múltiples refreshes simultáneos ante un 401. Solución correcta para escenarios de peticiones paralelas con token expirado.

#### Layouts diferenciados y organizados
`SiteLayout` (público: Navbar + Footer + Outlet) y `AdminLayout` (admin: nav condicional por rol + Outlet) claramente separados.

#### PrivateRoute con doble nivel de guardia
- **Nivel 1**: `allowedRoles={["admin", "superadmin"]}` — protege todo el dashboard.
- **Nivel 2**: `allowedRoles={["superadmin"]}` — protege `/admin/usuarios` e `/admin/historial`.
No hay flash de redirección gracias al estado `"checking"` que retorna `null`.

#### Sistema de diseño en CSS variables
`src/index.css` define tokens globales en `:root`: `--brand`, `--bg`, `--text`, `--muted`, `--card`, `--border`, `--shadow`, `--r`.

#### CartContext bien encapsulado
API clara con `addItem`, `removeItem`, `inc`, `dec`, `setQty`, `normalizeQty`, `clear`, `open`, `close`. Persistencia versionada en `cotizacion_cart_v1`. El hook `useCart()` lanza error si se usa fuera del provider.

#### Historial con exportación PDF y configuración de retención
Filtrado por módulo, exportación a PDF, configuración de limpieza (nunca / 2 meses / 6 meses / 1 año), confirmación antes de borrar.

#### Alias de rutas en Vite ✅ APLICADO
`@`, `@api`, `@components`, `@pages`, `@context`, `@layouts` disponibles desde `vite.config.js`.

### Backend

#### Permisos personalizados bien separados
`permissions.py` define `IsSuperAdmin` (`is_superuser=True`) e `IsAdmin` (`is_staff=True and not is_superuser`). La distinción entre roles es explícita y limpia.

#### JWT configurado de forma razonable
Access token de 15 minutos y refresh de 1 día. `ROTATE_REFRESH_TOKENS=True` genera un nuevo refresh en cada uso. Headers `Bearer` estándar.

#### settings.py robusto para múltiples entornos
`get_database_config()` soporta `DATABASE_URL`, variables `POSTGRES_*` individuales, y SQLite como fallback. Los tests usan SQLite automáticamente. Todo configurable via `.env` sin tocar el código.

#### Seguridad de producción preparada
Cuando `DEBUG=False`: `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` se activan automáticamente. `X_FRAME_OPTIONS=DENY` y `SECURE_BROWSER_XSS_FILTER` siempre activos.

#### Historial como audit trail
El modelo `Historial` registra módulo, acción, descripción, usuario y fecha. `ConfiguracionSistema` controla la retención. Los ViewSets que hacen CRUD crean entradas de historial.

#### Cloudinary bien encapsulado
`cloudinary_service.py` centraliza la lógica de upload. El serializer recibe `imagen_file` (write-only) y la vista maneja el upload antes de guardar el objeto.

---

## Problemas y mejoras recomendadas

### 1. Backend: `DEFAULT_PERMISSION_CLASSES: AllowAny` — Riesgo alto
**Problema:** La configuración global de DRF permite acceso a cualquier endpoint sin autenticación. Cualquier vista que no declare explícitamente su permission class queda pública por defecto.

**Revisión necesaria:** Auditar todos los ViewSets y APIViews para confirmar que cada uno con operaciones de escritura (POST/PUT/PATCH/DELETE) tiene `permission_classes` explícito.

**Mejora:** Cambiar el default global a `IsAuthenticated` y declarar explícitamente `AllowAny` solo en los endpoints que deben ser públicos (GET de productos, categorías, servicios, etc.):

```python
# settings.py
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}
```

---

### 2. Backend: Tokens no se invalidan al hacer logout
**Problema:** `BLACKLIST_AFTER_ROTATION = False` y `rest_framework_simplejwt.token_blacklist` no está en `INSTALLED_APPS`. Esto significa que un refresh token robado sigue siendo válido hasta que expire naturalmente (1 día), incluso después de que el usuario haga logout.

**Mejora:**
1. Agregar `'rest_framework_simplejwt.token_blacklist'` a `INSTALLED_APPS`
2. Cambiar `BLACKLIST_AFTER_ROTATION = True` en `SIMPLE_JWT`
3. Correr `python manage.py migrate`
4. En el endpoint de logout del frontend, llamar a `/api/auth/logout/` que invalide el refresh token

---

### 3. Frontend: `users.js` duplica `admin.js`
**Problema:** `src/api/users.js` y `src/api/admin.js` parecen tener las mismas operaciones CRUD sobre usuarios administradores. Si ambos están en uso, es deuda técnica; si uno está sin usar, es código muerto.

**Acción:** Confirmar cuál se usa en componentes, eliminar el otro, y actualizar las importaciones.

---

### 4. Frontend: Tokens en localStorage — Riesgo de seguridad
**Problema:** `access`, `refresh`, `is_admin` y `role` se guardan en localStorage. Un script XSS puede leerlos.

**Mejora prioritaria (hoy):** Centralizar todo acceso a tokens exclusivamente en `src/api/auth.js`. Nunca llamar `localStorage.getItem("access")` fuera de ese archivo. `axios.js` ya lo hace bien; verificar que ningún componente acceda directamente.

**Mejora estructural (coordinar con backend):** Mover tokens a cookies `HttpOnly; Secure; SameSite=Strict`. Requiere cambios en el backend (endpoint que setea cookies en lugar de devolver tokens en JSON). Esto elimina el riesgo XSS de raíz.

---

### 5. Frontend: El flag `is_admin` en localStorage es manipulable
**Problema:** `PrivateRoute` usa `localStorage.getItem("is_admin")` para decidir acceso. Cualquier usuario puede escribir `localStorage.setItem("is_admin", "1")` en la consola.

**Aclaración:** La seguridad real está en el backend — cada endpoint valida el token y los permisos. La validación del cliente es solo UX.

**Mejora mínima:** Agregar un comentario en `PrivateRoute.jsx` que indique explícitamente que esta guardia es de UX, no de seguridad. Así queda claro para cualquier desarrollador futuro.

---

### 6. Sin tests en ninguna capa
**Problema:** Ni frontend ni backend tienen tests. `catalogo/tests.py` está vacío. La lógica del carrito, los interceptores, los permisos y los endpoints no tienen cobertura.

**Frontend — Vitest:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```
Cubrir mínimamente: `CartContext`, `src/api/auth.js`, `PrivateRoute`.

**Backend — pytest-django:**
```bash
pip install pytest-django
```
Cubrir mínimamente: permisos (`IsSuperAdmin`, `IsAdmin`), endpoints protegidos (verificar 401/403), creación de historial en CRUD.

---

### 7. Frontend: Estado de servidor con `useState + useEffect`
**Problema:** Todos los fetches usan el patrón manual: sin caché, sin deduplicación, sin revalidación. Si dos componentes necesitan los mismos productos, se hacen dos peticiones independientes.

**Mejora de mayor impacto:** Adoptar **TanStack Query (React Query)**. Aporta caché automático, deduplicación, estados `isLoading`/`isError`, e invalidación de caché tras mutaciones.

```bash
npm install @tanstack/react-query
```
Se puede migrar módulo por módulo, sin reescribir todo de una vez.

---

### 8. Sin TypeScript en el frontend
**Problema:** Las respuestas del API no tienen shape definido. Un cambio en el backend (renombrar un campo) rompe silenciosamente el frontend. `@types/react` y `@types/react-dom` ya están instalados — la intención estuvo presente.

**Mejora progresiva:**
1. `tsconfig.json` con `"allowJs": true` — no rompe nada existente
2. Migrar `src/api/*.ts` primero — son los contratos con el backend
3. Migrar componentes reutilizados (`ProductCard`, `CartDrawer`, `PrivateRoute`)
4. Páginas del dashboard al final

---

### 9. Variables de entorno de producción no configuradas
**Frontend:** `Fra/.env` apunta a `http://127.0.0.1:8000/api`. Falta crear `Fra/.env.production`:
```
VITE_API_URL=https://tu-backend-produccion.com/api
```

**Backend:** Falta un `.env` o sistema de secrets para producción con `DJANGO_SECRET_KEY`, `DATABASE_URL`, `CLOUDINARY_*`, `EMAIL_HOST_PASSWORD`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CORS_ALLOWED_ORIGINS`. Sin esto no se puede hacer deploy.

---

### 10. Frontend: Notificaciones de error inconsistentes
**Problema:** Algunos componentes usan `useState` local para errores, otros usan `alert()`. No hay sistema centralizado.

**Mejora:** Instalar `sonner` o `react-hot-toast` (< 5 KB). Setup de 10 minutos. Elimina los `alert()` y unifica el feedback visual.

---

## Resumen de prioridades

| Prioridad | Capa | Mejora | Esfuerzo |
|---|---|---|---|
| Alta | Backend | Cambiar `DEFAULT_PERMISSION_CLASSES` a `IsAuthenticated` y auditar views | Bajo |
| Alta | Frontend | Centralizar acceso a tokens en `auth.js` | Bajo |
| Alta | Ambos | Crear archivos `.env` de producción | Muy bajo |
| Alta | Ambos | Tests básicos (Vitest + pytest-django) | Bajo-Medio |
| Media | Backend | Habilitar blacklist de refresh tokens (logout real) | Bajo |
| Media | Frontend | Eliminar `users.js` si es duplicado de `admin.js` | Muy bajo |
| Media | Frontend | TanStack Query para estado de servidor | Medio |
| Media | Ambos | Tokens en cookies HttpOnly (elimina riesgo XSS) | Medio |
| Baja | Frontend | TypeScript progresivo | Alto |
| Baja | Frontend | Sistema de toast centralizado | Bajo |

---

## Veredicto general

La arquitectura es **sólida para el tamaño y propósito del proyecto**. La separación en capas (API, componentes, páginas, contexto en el front; app única con ViewSets, serializers y permisos en el back) es correcta y consistente. El código es predecible y extensible.

El riesgo más inmediato está en el backend: `DEFAULT_PERMISSION_CLASSES: AllowAny` significa que cualquier vista que olvide declarar permisos queda pública. Esto debe auditarse y corregirse antes de cualquier deploy.

Los tres refuerzos más importantes:
1. **Auditar y corregir permisos en el backend** — una tarde de revisión puede cerrar exposiciones reales.
2. **Crear los archivos `.env` de producción** — sin esto no hay deploy posible.
3. **Habilitar blacklist de tokens** — hace que el logout sea real, no solo visual.
