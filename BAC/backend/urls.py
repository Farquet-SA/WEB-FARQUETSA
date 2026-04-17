from django.contrib import admin
from django.urls import path, include
from catalogo.views import CurrentUserView, CookieLoginView, CookieRefreshView, LogoutView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", CookieLoginView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", CookieRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", LogoutView.as_view(), name="token_logout"),
    path("api/auth/me/", CurrentUserView.as_view(), name="auth_me"),
    path("api/", include("catalogo.urls")),
]
