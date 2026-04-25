from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from catalogo.views import CurrentUserView, CookieLoginView, CookieRefreshView, LogoutView


@api_view(["GET"])
@permission_classes([AllowAny])
def healthcheck(_request):
    return Response({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", healthcheck, name="healthcheck"),
    path("api/auth/login/", CookieLoginView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", CookieRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", LogoutView.as_view(), name="token_logout"),
    path("api/auth/me/", CurrentUserView.as_view(), name="auth_me"),
    path("api/", include("catalogo.urls")),
]
