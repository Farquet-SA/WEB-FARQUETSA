from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from .models import Categoria, Producto, Servicio


class CatalogSecurityTests(APITestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(nombre="Analgesicos", slug="analgesicos")
        self.producto = Producto.objects.create(
            nombre="Paracetamol",
            descripcion="500mg",
            precio=10,
            categoria=self.categoria,
            estado=Producto.Estado.DISPONIBLE,
        )
        self.admin_user = User.objects.create_user(
            username="admin",
            password="adminpass123",
            is_staff=True,
        )
        self.normal_user = User.objects.create_user(
            username="cliente",
            password="clientepass123",
            is_staff=False,
        )
        self.super_user = User.objects.create_superuser(
            username="root",
            password="rootpass123",
            email="root@example.com",
        )

    def _login(self, username, password):
        response = self.client.post(
            "/api/auth/login/",
            {"username": username, "password": password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def test_public_can_list_products(self):
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_public_can_filter_products_by_search(self):
        response = self.client.get("/api/products/", {"q": "para"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["nombre"], "Paracetamol")

    def test_non_admin_cannot_create_product(self):
        access = self._login("cliente", "clientepass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        response = self.client.post(
            "/api/products/",
            {
                "nombre": "Ibuprofeno",
                "descripcion": "400mg",
                "precio": "15.00",
                "categoria": self.categoria.id,
                "estado": Producto.Estado.DISPONIBLE,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_product(self):
        access = self._login("admin", "adminpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        response = self.client.post(
            "/api/products/",
            {
                "nombre": "Amoxicilina",
                "descripcion": "500mg",
                "precio": "20.00",
                "categoria": self.categoria.id,
                "estado": Producto.Estado.DISPONIBLE,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("imagen_file", response.data)

    def test_auth_me_requires_authentication(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_sets_refresh_cookie(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "admin", "password": "adminpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh_token", response.cookies)
        self.assertTrue(response.cookies["refresh_token"]["httponly"])

    def test_refresh_uses_cookie(self):
        login = self.client.post(
            "/api/auth/login/",
            {"username": "admin", "password": "adminpass123"},
            format="json",
        )
        self.client.cookies["refresh_token"] = login.cookies["refresh_token"].value

        response = self.client.post("/api/auth/refresh/", {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_auth_me_returns_staff_flag(self):
        access = self._login("admin", "adminpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "admin")
        self.assertTrue(response.data["is_staff"])

    @patch("catalogo.serializers.upload_product_image")
    def test_admin_can_create_product_with_image_upload(self, mock_upload_product_image):
        mock_upload_product_image.return_value = "https://res.cloudinary.com/demo/image/upload/sample.jpg"
        access = self._login("admin", "adminpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        image = SimpleUploadedFile(
            "producto.gif",
            (
                b"GIF87a\x01\x00\x01\x00\x80\x00\x00"
                b"\x00\x00\x00\xff\xff\xff!\xf9\x04\x00\x00\x00\x00\x00,"
                b"\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
            ),
            content_type="image/gif",
        )

        response = self.client.post(
            "/api/products/",
            {
                "nombre": "Vitamina C",
                "descripcion": "Tabletas",
                "precio": "12.50",
                "categoria": str(self.categoria.id),
                "estado": Producto.Estado.DISPONIBLE,
                "imagen_file": image,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["imagen"],
            "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        )
        mock_upload_product_image.assert_called_once()

    def test_upload_endpoint_rejects_non_image_file(self):
        access = self._login("admin", "adminpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        file_obj = SimpleUploadedFile(
            "producto.txt",
            b"no es una imagen",
            content_type="text/plain",
        )

        response = self.client.post(
            "/api/uploads/product-image/",
            {"file": file_obj},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("file", response.data)

    def test_product_price_must_be_positive(self):
        access = self._login("admin", "adminpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        response = self.client.post(
            "/api/products/",
            {
                "nombre": "Precio inválido",
                "descripcion": "Producto de prueba",
                "precio": "0.00",
                "categoria": self.categoria.id,
                "estado": Producto.Estado.DISPONIBLE,
                "imagen": "https://example.com/producto.jpg",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("precio", response.data)

    def test_regular_admin_cannot_list_admin_users(self):
        access = self._login("admin", "adminpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        response = self.client.get("/api/admins/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_superadmin_can_list_admin_users(self):
        access = self._login("root", "rootpass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        response = self.client.get("/api/admins/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ServiciosPermissionsTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin2", password="adminpass123", is_staff=True
        )
        self.servicio = Servicio.objects.create(
            icon="icon-test", title="Servicio de prueba", text="Descripción"
        )

    def _login_admin(self):
        resp = self.client.post(
            "/api/auth/login/",
            {"username": "admin2", "password": "adminpass123"},
            format="json",
        )
        token = resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_public_can_list_servicios(self):
        response = self.client.get("/api/servicios/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_anonymous_cannot_create_servicio(self):
        response = self.client.post(
            "/api/servicios/",
            {"icon": "icon-new", "title": "Nuevo", "text": "Texto"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_create_servicio(self):
        self._login_admin()
        response = self.client.post(
            "/api/servicios/",
            {"icon": "icon-new", "title": "Nuevo", "text": "Texto"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_anonymous_cannot_delete_servicio(self):
        response = self.client.delete(f"/api/servicios/{self.servicio.id}/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ContactoViewTests(APITestCase):
    @patch("catalogo.views.send_mail")
    def test_contacto_is_public(self, mock_send):
        mock_send.return_value = 1
        response = self.client.post(
            "/api/contacto/",
            {
                "nombre": "Ana",
                "apellido": "López",
                "email": "ana@example.com",
                "mensaje": "Hola, consulta de prueba.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_send.assert_called_once()

    def test_contacto_rejects_invalid_email(self):
        response = self.client.post(
            "/api/contacto/",
            {
                "nombre": "Ana",
                "apellido": "López",
                "email": "correo-invalido",
                "mensaje": "Hola, consulta de prueba.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)


class HealthcheckTests(APITestCase):
    def test_healthcheck_is_public(self):
        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")
