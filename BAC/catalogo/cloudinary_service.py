from django.conf import settings
from rest_framework.exceptions import ValidationError

try:
    import cloudinary
    import cloudinary.uploader
except ImportError:
    cloudinary = None


def upload_product_image(file_obj):
    if not file_obj:
        return None

    if cloudinary is None:
        raise ValidationError(
            {"imagen_file": "Cloudinary no esta instalado en el backend."}
        )

    storage = getattr(settings, 'CLOUDINARY_STORAGE', {})
    cloud_name = storage.get('CLOUD_NAME', '')
    api_key = storage.get('API_KEY', '')
    api_secret = storage.get('API_SECRET', '')

    if not all([cloud_name, api_key, api_secret]):
        raise ValidationError(
            {"imagen_file": "Faltan credenciales de Cloudinary en el archivo .env."}
        )

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )

    result = cloudinary.uploader.upload(
        file_obj,
        folder=getattr(settings, 'CLOUDINARY_UPLOAD_FOLDER', 'uploads'),
        resource_type="image",
    )
    return result.get("secure_url") or result.get("url")