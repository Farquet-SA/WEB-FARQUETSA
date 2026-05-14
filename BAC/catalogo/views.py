from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework import viewsets
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import User
from django.conf import settings
from django.core.mail import send_mail
from .serializers import AdminSerializer
from .permissions import IsSuperAdmin

from .utils import registrar_historial
from rest_framework.decorators import api_view, permission_classes, action

from django.utils import timezone

from .models import Producto, Categoria, ImagenInformacion, Servicio, PasoProceso, Confianza, Historial, ConfiguracionSistema, Publicacion
from .serializers import ProductoSerializer, CategoriaSerializer, ImagenInformacionSerializer, ServicioSerializer, PasoProcesoSerializer, ConfianzaSerializer, PublicacionSerializer
from .cloudinary_service import upload_product_image


COOKIE_NAME = settings.SIMPLE_JWT_REFRESH_COOKIE


def _set_refresh_cookie(response, refresh_token):
    response.set_cookie(
        key=COOKIE_NAME,
        value=str(refresh_token),
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Strict",
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        path="/api/auth/",
    )


class DynamicProductPagination(PageNumberPagination):
    page_size = 8 # valor por defecto
    page_size_query_param = None  # clientes no pueden cambiarlo

    def get_page_size(self, request):
        config, _ = ConfiguracionSistema.objects.get_or_create(id=1)
        return config.productos_por_pagina or 8


class CookieLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenObtainPairSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        access = serializer.validated_data["access"]
        refresh = serializer.validated_data["refresh"]

        resp = Response({"access": str(access)}, status=status.HTTP_200_OK)
        _set_refresh_cookie(resp, refresh)
        return resp


class CookieRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get(COOKIE_NAME)
        if not refresh_token:
            return Response(
                {"detail": "No refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            resp = Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
            resp.delete_cookie(COOKIE_NAME, path="/api/auth/")
            return resp

        access = serializer.validated_data["access"]
        new_refresh = serializer.validated_data.get("refresh")

        resp = Response({"access": str(access)}, status=status.HTTP_200_OK)
        if new_refresh:
            _set_refresh_cookie(resp, new_refresh)
        return resp


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get(COOKIE_NAME)
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass

        resp = Response({"detail": "Sesión cerrada."}, status=status.HTTP_200_OK)
        resp.delete_cookie(COOKIE_NAME, path="/api/auth/")
        return resp


class CategoriaViewSet(ModelViewSet):
    queryset = Categoria.objects.all().order_by("nombre")
    serializer_class = CategoriaSerializer

    def get_permissions(self):
        # GET público (list/retrieve), escritura solo admin
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "crear",
            "categorias",
            f"Creó la categoría {response.data['nombre']}"
        )

        return response
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        response = super().update(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "editar",
            "categorias",
            f"Editó la categoría {instance.nombre} a {response.data['nombre']}"
        )

        return response
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        registrar_historial(
            request.user,
            "eliminar",
            "categorias",
            f"Eliminó la categoría {instance.nombre}"
        )

        return super().destroy(request, *args, **kwargs)


class ProductoViewSet(ModelViewSet):
    queryset = Producto.objects.select_related("categoria").all().order_by("-updated_at")
    serializer_class = ProductoSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = DynamicProductPagination

    def get_queryset(self):
        queryset = Producto.objects.select_related("categoria").all()
        params = self.request.query_params

        query = params.get("q", "").strip()
        if query:
            queryset = queryset.filter(nombre__icontains=query)

        destacado = params.get("destacado")
        if destacado is not None:
            queryset = queryset.filter(
                destacado=str(destacado).strip().lower() in {"1", "true", "yes", "si", "sí"}
            )

        estado = params.get("estado", "").strip().lower()
        if estado in {choice.value for choice in Producto.Estado}:
            queryset = queryset.filter(estado=estado)

        # Soporte para una o varias categorías: ?categoria=1&categoria=2
        categorias = params.getlist("categoria")
        categorias = [c.strip() for c in categorias if c.strip()]
        if categorias:
            queryset = queryset.filter(categoria_id__in=categorias)

        return queryset.order_by("-updated_at")

    def get_permissions(self):
        # GET público (list/retrieve), escritura solo admin
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "crear",
            "productos",
            f"Creó un producto llamado {response.data['nombre']}"
        )

        return response
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        response = super().update(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "editar",
            "productos",
            f"Editó el producto {instance.nombre}"
        )

        return response
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        registrar_historial(
            request.user,
            "eliminar",
            "productos",
            f"Eliminó el producto {instance.nombre}"
        )

        return super().destroy(request, *args, **kwargs)
    


class ImagenInformacionViewSet(ModelViewSet):
    queryset = ImagenInformacion.objects.all().order_by("orden", "-updated_at")
    serializer_class = ImagenInformacionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # para manejar roles
        if user.is_superuser:
            role = "superadmin"
        elif user.is_staff:
            role = "admin"
        else:
            role = "user"

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "role": role,  
            }
        )
    
class ProductImageUploadView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get("file")
        if not file_obj:
            raise ValidationError({"file": "Debes seleccionar una imagen."})

        image_url = upload_product_image(file_obj)
        return Response({"url": image_url}, status=status.HTTP_201_CREATED)

class AdminViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_staff=True)
    serializer_class = AdminSerializer
    permission_classes = [IsSuperAdmin]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "crear",
            "usuarios",
            f"Creó un nuevo usuario llamado {response.data['username']} con el rol de {'superadmin' if response.data['is_superuser'] else 'admin'}"
        )

        return response
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        response = super().update(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "editar",
            "usuarios",
            f"Editó el usuario {instance.username}"
        )

        return response
    
    @action(detail=True, methods=["patch"])
    def toggle_active(self, request, pk=None):
        user = self.get_object()

        user.is_active = not user.is_active
        user.save()

        estado = "activó" if user.is_active else "desactivó"

        registrar_historial(
            request.user,
            "editar",
            "usuarios",
            f"{estado} al usuario {user.username}"
        )

        return Response({
            "status": f"Usuario {estado}",
            "is_active": user.is_active
        })


@api_view(["GET"])
@permission_classes([IsSuperAdmin])
def historial_list(request):
    modulo = request.GET.get("modulo")

    historial = Historial.objects.all().order_by("-fecha")

    if modulo:
        historial = historial.filter(modulo=modulo)

    data = [
        {
            "usuario": h.usuario.username if h.usuario else "N/A",
            "accion": h.accion,
            "fecha": timezone.localtime(h.fecha).strftime("%Y-%m-%d"),
            "hora": timezone.localtime(h.fecha).strftime("%H:%M:%S"),
            "detalle": h.descripcion,
          
        }
        for h in historial
    ]

    return Response(data)




@api_view(['GET', 'POST'])
@permission_classes([IsSuperAdmin])
def configuracion_limpieza(request):
    config, _ = ConfiguracionSistema.objects.get_or_create(id=1)

    if request.method == 'GET':
        return Response({'meses': config.meses_retencion_historial})

    if request.method == 'POST':
        meses = request.data.get('meses')
        config.meses_retencion_historial = meses
        config.save()
        return Response({'status': 'Configuración actualizada'})

@api_view(['GET', 'POST'])
@permission_classes([IsSuperAdmin])
def configuracion_paginacion(request):
    config, _ = ConfiguracionSistema.objects.get_or_create(id=1)

    if request.method == 'GET':
        return Response({'productos_por_pagina': config.productos_por_pagina})

    if request.method == 'POST':
        valor = request.data.get('productos_por_pagina')
        try:
            valor = int(valor)
            if valor < 1 or valor > 100:
                return Response({'error': 'El valor debe estar entre 1 y 100.'}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError):
            return Response({'error': 'Valor inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        config.productos_por_pagina = valor
        config.save()
        return Response({'status': 'Configuración actualizada', 'productos_por_pagina': valor})


class ContactoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        nombre = request.data.get("nombre")
        apellido = request.data.get("apellido")
        email = request.data.get("email")
        mensaje = request.data.get("mensaje")

        send_mail(
            subject="Nuevo mensaje desde formulario de contacto",
            message=f"""
                Nombre: {nombre}
                Apellido: {apellido}
                Correo: {email}
                Mensaje: {mensaje}
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.CONTACT_RECEIVER_EMAIL],
            fail_silently=False,
        )

        return Response(
            {"message": "Correo enviado correctamente"},
            status=status.HTTP_200_OK
        )
    

class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "crear",
            "servicios",
            f"Creó el servicio {response.data['title']}"
        )

        return response

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        response = super().update(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "editar",
            "servicios",
            f"Editó el servicio {instance.title}"
        )

        return response

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        registrar_historial(
            request.user,
            "eliminar",
            "servicios",
            f"Eliminó el servicio {instance.title}"
        )

        return super().destroy(request, *args, **kwargs)


class PasoProcesoViewSet(viewsets.ModelViewSet):
    queryset = PasoProceso.objects.all()
    serializer_class = PasoProcesoSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "crear",
            "servicios",
            f"Creó el paso de proceso {response.data['title']}"
        )

        return response

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        response = super().update(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "editar",
            "servicios",
            f"Editó el paso de proceso {instance.title}"
        )

        return response

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        registrar_historial(
            request.user,
            "eliminar",
            "servicios",
            f"Eliminó el paso de proceso {instance.title}"
        )

        return super().destroy(request, *args, **kwargs)


class ConfianzaViewSet(viewsets.ModelViewSet):
    queryset = Confianza.objects.all()
    serializer_class = ConfianzaSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "crear",
            "servicios",
            f"Creó el elemento de confianza {response.data['title']}"
        )

        return response

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        response = super().update(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "editar",
            "servicios",
            f"Editó el elemento de confianza {instance.title}"
        )

        return response

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        registrar_historial(
            request.user,
            "eliminar",
            "servicios",
            f"Eliminó el elemento de confianza {instance.title}"
        )

        return super().destroy(request, *args, **kwargs)
    
class PublicacionViewSet(viewsets.ModelViewSet):
    queryset = Publicacion.objects.all()
    serializer_class = PublicacionSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "crear",
            "servicios",
            f"Creó la publicación {response.data['title']}"
        )

        return response

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        response = super().update(request, *args, **kwargs)

        registrar_historial(
            request.user,
            "editar",
            "servicios",
            f"Editó la publicación {instance.title}"
        )

        return response

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        registrar_historial(
            request.user,
            "eliminar",
            "servicios",
            f"Eliminó la publicación {instance.title}"
        )

        return super().destroy(request, *args, **kwargs)
