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

# --- Currency Exchange Module ViewSets ---
router.register(r'exchange-rates', views.ExchangeRateViewSet, basename='exchange-rates')
router.register(r'currency-exchanges', views.CurrencyExchangeRequestViewSet, basename='currency-exchanges')
router.register(r'notifications', views.NotificationViewSet, basename='notifications')

# Add custom URL for exchange rate simulation
exchange_rates_viewset = views.ExchangeRateViewSet.as_view({
    'post': 'simulate_exchange'
})

urlpatterns = [
    # Page d'accueil simple de l'app Travel
    path("", lambda request: HttpResponse("Bienvenue dans le module Travel 🚀"), name="index"),
    
    # Add the new URL pattern for exchange rate simulation
    path('exchange-rates/simulate_exchange/', exchange_rates_viewset, name='simulate-exchange'),

    # Endpoints générés par le router
    path("api/", include(router.urls)),

    # Legacy endpoint (keeping for backward compatibility)
    path("dossiers-create/", views.DossierVoyageListCreate.as_view(), name="dossier-list-create"),
]
