from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import DossierVoyageViewSet, DocumentVoyageViewSet, DossierVoyageListCreate
from django.http import HttpResponse

# Router DRF pour ViewSets
router = DefaultRouter()
router.register(r"dossiers", DossierVoyageViewSet, basename="dossiers")
router.register(r"documents", DocumentVoyageViewSet, basename="documents")

urlpatterns = [
    # Page d’accueil simple de l’app Travel
    path("", lambda request: HttpResponse("Bienvenue dans le module Travel 🚀"), name="index"),

    # Endpoints générés par le router (dossiers et documents)
    path("api/", include(router.urls)),

    # Endpoint DRF pour liste et création de dossiers (DRF generics)
    # path("api/dossiers-create/", DossierVoyageListCreate.as_view(), name="dossier-list-create"),
    path("dossiers-create/", views.DossierVoyageListCreate.as_view(), name="dossier-list-create"),
]
