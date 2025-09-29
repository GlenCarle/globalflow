from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from .views import (
    home, api_root, ClientListView, RegisterView, 
    UserProfileView, ProfilePictureUploadView, ClientViewSet, 
    TravelTypeViewSet, DocumentViewSet, AgentClientListView, AgentRequestListView
)

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
    path("api/users/me/", UserProfileView.as_view(), name='user-profile'),
    path("api/users/profile-picture/", ProfilePictureUploadView.as_view(), name='profile-picture-upload'),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"), # Rafraîchir token
    path("api/logout/", TokenBlacklistView.as_view(), name="token_blacklist"),   # Déconnexion
    
    # Agent endpoints
    path("api/agent/clients/", AgentClientListView.as_view(), name="agent-clients"),
    path("api/agent/requests/", AgentRequestListView.as_view(), name="agent-requests")
]
