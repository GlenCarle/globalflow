# travel/views.py
from django.http import HttpResponse, JsonResponse
from rest_framework import viewsets, permissions, generics
from .models import DossierVoyage, DocumentVoyage
from .serializers import DossierVoyageSerializer, DocumentVoyageSerializer

# Page d'accueil simple
def index(request):
    return HttpResponse("Bienvenue dans le module Travel 🚀")

# --- ViewSets DRF ---
class DossierVoyageViewSet(viewsets.ModelViewSet):
    queryset = DossierVoyage.objects.all().order_by("-created_at")
    serializer_class = DossierVoyageSerializer
    permission_classes = [permissions.IsAuthenticated]

class DocumentVoyageViewSet(viewsets.ModelViewSet):
    queryset = DocumentVoyage.objects.all().order_by("-created_at")
    serializer_class = DocumentVoyageSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- List/Create API DRF (optionnel si tu veux une endpoint séparée) ---
class DossierVoyageListCreate(generics.ListCreateAPIView):
    queryset = DossierVoyage.objects.all().order_by("-created_at")
    serializer_class = DossierVoyageSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- Version fonctionnelle simple pour JSON (optionnel) ---
def dossier_voyage_list_json(request):
    data = list(DossierVoyage.objects.values())
    return JsonResponse(data, safe=False)
