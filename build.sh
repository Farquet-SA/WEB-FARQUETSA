#!/bin/bash
set -e

echo "==> Instalando dependencias..."
pip install -r BAC/requirements.txt

echo "==> Corriendo migraciones..."
cd BAC && python manage.py migrate --noinput

echo "==> Colectando archivos estáticos..."
python manage.py collectstatic --noinput
