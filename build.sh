#!/bin/bash
set -e

echo "==> Instalando dependencias..."
uv pip install -r BAC/requirements.txt --system --break-system-packages

echo "==> Corriendo migraciones..."
cd BAC && python manage.py migrate --noinput

echo "==> Colectando archivos estáticos..."
python manage.py collectstatic --noinputv