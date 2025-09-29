from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.views import home, api_root
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Page d'accueil web classique
    path("", home, name="home"),

    # Admin
    path("admin/", admin.site.urls),

    # Page d'accueil JSON API
    path("api/", api_root, name="api-root"),

    # JWT Authentication (moved to core.urls)

    # APIs des apps
    path("api/core/", include("core.urls")),
    path("api/travel/", include("travel.urls")),
    path("", include("core.urls")),
    # pour accéder aux pages Travel directement hors API (optionnel)
    path("travel/", include("travel.urls")),
]

# Servir les fichiers médias en mode développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
