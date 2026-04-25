# Farquetsa Web

Aplicación full-stack para catálogo farmacéutico, cotizaciones y panel administrativo.

## Stack

- Frontend: React, Vite, React Router, TanStack Query, Axios.
- Backend: Django, Django REST Framework, SimpleJWT, PostgreSQL/SQLite, Cloudinary.
- Tests: Django test runner y Vitest.

## Estructura

```text
BAC/   Backend Django + API REST
Fra/   Frontend React + Vite
```

## Requisitos

- Python 3.12+
- Node.js 20+
- PostgreSQL para producción
- Cuenta de Cloudinary para subida de imágenes
- Cuenta SMTP para formulario de contacto

## Instalación Local

### Backend

```bash
cd BAC
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 127.0.0.1:8000
```

### Frontend

```bash
cd Fra
npm install
copy .env.example .env
npm run dev
```

URLs locales:

- Frontend: `http://localhost:5173`
- Backend API: `http://127.0.0.1:8000/api`
- Django Admin: `http://127.0.0.1:8000/admin`

## Validación

Backend:

```bash
cd BAC
python manage.py check
python manage.py test catalogo
```

Frontend:

```bash
cd Fra
npm run lint
npm run test:run
npm run build
```

## Producción

Antes de desplegar:

- Configurar `DJANGO_DEBUG=False`.
- Usar un `DJANGO_SECRET_KEY` único y fuerte.
- Definir `DJANGO_ALLOWED_HOSTS`, `DJANGO_CORS_ALLOWED_ORIGINS` y `DJANGO_CSRF_TRUSTED_ORIGINS` con dominios reales.
- Configurar `DATABASE_URL` con PostgreSQL.
- Configurar Cloudinary y SMTP.
- Cambiar `Fra/.env.production` para apuntar al backend real.
- Ejecutar migraciones y crear un superusuario.
- Servir el sitio sobre HTTPS.

## Seguridad Incluida

- Refresh token en cookie HttpOnly.
- Access token de vida corta.
- Permisos globales autenticados en DRF.
- Endpoints públicos declarados explícitamente.
- Rate limiting en login, refresh, contacto y uploads.
- Validación de imágenes por tipo y tamaño.
- Validación formal del formulario de contacto.
- Headers de seguridad base para producción.

