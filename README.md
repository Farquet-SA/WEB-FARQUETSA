# WEB-FARQUETSA — Guía de configuración local

## Requisitos previos

Asegúrate de tener instalado:
- [Python 3.12+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/Farquet-SA/WEB-FARQUETSA.git
cd WEB-FARQUETSA
```

---

## 2. Configurar Git

Todos los commits o merges de main deben salir bajo la cuenta del proyecto. Configurar esto antes de trabajar sobre main:

```bash
git config user.email "farquetsaweb@outlook.com"
git config user.name "Farquet-SA"
```

---

## 3. Configurar el Backend (Django)

### Crear y activar el entorno virtual

```bash
cd BAC

# Crear el entorno virtual
python -m venv venv

# Activar (Windows)
.\venv\Scripts\activate

# Activar (Mac/Linux)
source venv/bin/activate
```

### Instalar dependencias

```bash
pip install -r requirements.txt
```

### Configurar variables de entorno

Crea un archivo `.env` dentro de la carpeta `BAC/` con los valores que te compartirá el líder del proyecto. La estructura es la siguiente:

```
DJANGO_SECRET_KEY=
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DJANGO_SECURE_SSL_REDIRECT=False
DATABASE_URL=
POSTGRES_CONN_MAX_AGE=60
POSTGRES_SSLMODE=require
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=bac_images/products
```

> ⚠️ Nunca subas el archivo `.env` al repositorio.

### Correr migraciones e iniciar el servidor

```bash
python manage.py migrate
python manage.py runserver
```

El backend estará disponible en: `http://127.0.0.1:8000`

---

## 4. Configurar el Frontend (React + Vite)

Abre una segunda terminal desde la raíz del proyecto:

```bash
cd Fra
npm install
```

### Configurar variables de entorno

Crea un archivo `.env` dentro de la carpeta `Fra/` con lo siguiente:

```
VITE_API_URL=http://127.0.0.1:8000/api
```

### Iniciar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## 5. Flujo de trabajo con Git

La rama de producción es `main` — **nunca hagas push directo a main**.

Todo el trabajo se hace en `develop`:

```bash
# Asegúrate de estar en develop y tenerla actualizada
git checkout develop
git pull origin develop

# Trabaja en tus cambios...

# Cuando termines, haz commit y push a develop
git add .
git commit -m "descripción de tus cambios"
git push origin develop
```

Los cambios pasan a producción (`main`) solo cuando el líder del proyecto hace el merge.
 
---

## Resumen de comandos diarios

| Acción | Comando |
|--------|---------|
| Activar venv (Windows) | `.\BAC\venv\Scripts\activate` |
| Iniciar backend | `cd BAC && python manage.py runserver` |
| Iniciar frontend | `cd Fra && npm run dev` |
| Actualizar dependencias Python | `pip install -r BAC/requirements.txt` |
| Actualizar dependencias Node | `cd Fra && npm install` |
