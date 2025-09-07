from django.contrib import admin
from django.urls import path, include
from core.views import home, api_root
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Page d'accueil web classique
    path("", home, name="home"),

    # Admin
    path("admin/", admin.site.urls),

    # Page d'accueil JSON API
    path("api/", api_root, name="api-root"),

    # JWT Authentication
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # APIs des apps
    path("api/core/", include("core.urls")),
    path("api/travel/", include("travel.urls")),
    path("", include("core.urls")),
    # Si tu veux accéder aux pages Travel directement hors API (optionnel)
    path("travel/", include("travel.urls")),
]
