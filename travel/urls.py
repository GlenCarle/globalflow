from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.http import HttpResponse

# Router DRF pour ViewSets
router = DefaultRouter()

# Visa System ViewSets
router.register(r'countries', views.CountryViewSet, basename='countries')
router.register(r'visa-types', views.VisaTypeViewSet, basename='visa-types')
router.register(r'required-documents', views.RequiredDocumentViewSet, basename='required-documents')
router.register(r'visa-applications', views.VisaApplicationViewSet, basename='visa-applications')
router.register(r'application-documents', views.ApplicationDocumentViewSet, basename='application-documents')
router.register(r'application-history', views.ApplicationHistoryViewSet, basename='application-history')

# Legacy ViewSets (keeping for backward compatibility)
router.register(r"dossiers", views.DossierVoyageViewSet, basename="dossiers")
router.register(r"documents", views.DocumentVoyageViewSet, basename="documents")

# --- Travel Booking Module ViewSets ---
router.register(r'travel-bookings', views.TravelBookingViewSet, basename='travel-bookings')
router.register(r'passengers', views.PassengerViewSet, basename='passengers')
router.register(r'travel-documents', views.TravelDocumentViewSet, basename='travel-documents')
router.register(r'booking-status-history', views.BookingStatusHistoryViewSet, basename='booking-status-history')
router.register(r'payments', views.PaymentViewSet, basename='payments')
router.register(r'appointments', views.AppointmentViewSet, basename='appointments')

urlpatterns = [
    # Page d'accueil simple de l'app Travel
    path("", lambda request: HttpResponse("Bienvenue dans le module Travel 🚀"), name="index"),

    # Endpoints générés par le router
    path("api/", include(router.urls)),

    # Legacy endpoint (keeping for backward compatibility)
    path("dossiers-create/", views.DossierVoyageListCreate.as_view(), name="dossier-list-create"),
]
