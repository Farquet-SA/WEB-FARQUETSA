from rest_framework import serializers
from .models import Producto, Categoria, ImagenInformacion, Servicio, PasoProceso, Confianza
from .cloudinary_service import upload_product_image
from django.utils.text import slugify
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password


ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
MAX_IMAGE_SIZE_MB = 5


def validate_image_upload(value, *, allow_gif=True):
    if value is None:
        return value

    allowed_types = ALLOWED_IMAGE_TYPES if allow_gif else ALLOWED_IMAGE_TYPES[:-1]
    content_type = getattr(value, "content_type", "")

    if content_type not in allowed_types:
        formats = "JPEG, PNG, WebP o GIF" if allow_gif else "JPG, PNG o WEBP"
        raise serializers.ValidationError(f"Solo se permiten imágenes en formato {formats}.")

    if value.size > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise serializers.ValidationError(
            f"La imagen no puede superar {MAX_IMAGE_SIZE_MB}MB."
        )

    return value


class ContactoSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=80, trim_whitespace=True)
    apellido = serializers.CharField(max_length=80, trim_whitespace=True)
    email = serializers.EmailField(max_length=254)
    mensaje = serializers.CharField(max_length=2000, trim_whitespace=True)

    def validate_mensaje(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("El mensaje debe tener al menos 10 caracteres.")
        return value



class CategoriaSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)  # el front nunca lo manda

    class Meta:
        model = Categoria
        fields = ["id", "nombre", "slug"]

    def validate_nombre(self, value):
        slug = slugify(value)
        qs = Categoria.objects.filter(slug=slug)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ya existe una categoría con ese nombre.")
        return value

    def create(self, validated_data):
        validated_data["slug"] = slugify(validated_data["nombre"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "nombre" in validated_data:
            validated_data["slug"] = slugify(validated_data["nombre"])
        return super().update(instance, validated_data)


class ProductoSerializer(serializers.ModelSerializer):
    # extra solo para lectura (para el frontend)
    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)
    imagen_file = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Producto
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, attrs):
        image_file = attrs.get("imagen_file")
        image_url = attrs.get("imagen")
        
        if self.instance is None and not image_file and not image_url:
            raise serializers.ValidationError(
                {"imagen_file": "La imagen es obligatoria al crear un producto."}
            )
        
        if image_file:
            try:
                validate_image_upload(image_file)
            except serializers.ValidationError as exc:
                raise serializers.ValidationError({"imagen_file": exc.detail})
        return attrs

    def create(self, validated_data):
        image_file = validated_data.pop("imagen_file", None)
        if image_file:
            validated_data["imagen"] = upload_product_image(image_file)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        image_file = validated_data.pop("imagen_file", None)
        if image_file:
            validated_data["imagen"] = upload_product_image(image_file)
        return super().update(instance, validated_data)

      
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a Q0.00.")
        if value > 999_999:
            raise serializers.ValidationError("El precio no puede superar Q999,999.00.")
        return value


    def validate_imagen_file(self, value):
        if value is None:
            return value

        return validate_image_upload(value)


class AdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "username", "password", "is_staff", "is_superuser", "is_active"]

    def create(self, validated_data):
        request = self.context.get('request')
        if request and not request.user.is_superuser:
            if validated_data.get('is_superuser', False):
                raise serializers.ValidationError("Solo los superadministradores pueden crear superusuarios.")

        password = validated_data.pop("password", None)
        if password:
            validate_password(password)

        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            raise serializers.ValidationError("La contraseña es requerida al crear un usuario.")

        # seguridad mínima
        if not user.is_staff:
            raise serializers.ValidationError("Debe ser al menos admin")

        user.save()
        return user

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and not request.user.is_superuser:
            if validated_data.get('is_superuser', instance.is_superuser) and not instance.is_superuser:
                raise serializers.ValidationError("Solo los superadministradores pueden promover a superusuario.")

        password = validated_data.pop("password", None)
        if password:
            validate_password(password, user=instance)
            instance.set_password(password)
        
        return super().update(instance, validated_data)
    
class ImagenInformacionSerializer(serializers.ModelSerializer):
    imagen_file = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = ImagenInformacion
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, attrs):
        imagen_file = attrs.get("imagen_file")
        imagen_url = attrs.get("imagen")

        if self.instance is None and not imagen_file and not imagen_url:
            raise serializers.ValidationError({
                "imagen_file": "La imagen es obligatoria al crear un registro de información."
            })

        if imagen_file:
            try:
                validate_image_upload(imagen_file, allow_gif=False)
            except serializers.ValidationError as exc:
                raise serializers.ValidationError({"imagen_file": exc.detail})

        return attrs

    def create(self, validated_data):
        imagen_file = validated_data.pop("imagen_file", None)
        if imagen_file:
            validated_data["imagen"] = upload_product_image(imagen_file)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        imagen_file = validated_data.pop("imagen_file", None)
        if imagen_file:
            validated_data["imagen"] = upload_product_image(imagen_file)
        return super().update(instance, validated_data)
    

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = "__all__"

class PasoProcesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasoProceso
        fields = "__all__"

class ConfianzaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Confianza
        fields = "__all__"


