from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from .views import ClientViewSet, home, ClientListView, RegisterView, api_root, TravelTypeViewSet, DocumentViewSet

# Router DRF
router = DefaultRouter()
router.register(r"clients", ClientViewSet, basename="client")
router.register(r'travel-types', TravelTypeViewSet, basename="traveltype")
router.register(r'documents', DocumentViewSet, basename="document")

urlpatterns = [
    # Page d’accueil globale
    path("", home, name="home"),

    # API root
    path("api/", api_root, name="api-root"),

    # API Clients via ViewSet
    path("api/", include(router.urls)),

    # Liste des clients via ListAPIView
    path("api/clients-list/", ClientListView.as_view(), name="clients-list"),

    # Authentification
    path("api/register/", RegisterView.as_view(), name="register"),           # Inscription + tokens auto
    path("api/login/", TokenObtainPairView.as_view(), name="token_obtain"),   # Connexion
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"), # Rafraîchir token
    path("api/logout/", TokenBlacklistView.as_view(), name="token_blacklist"),   # Déconnexion
]
