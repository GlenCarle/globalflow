from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

# Django REST Framework
from rest_framework import viewsets, generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

# SimpleJWT
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Client, Profile, Document, TravelType
from .serializers import ClientSerializer, RegisterSerializer,TravelTypeSerializer,DocumentSerializer
from .permissions import IsAdmin, IsAgent


# --- API Clients ---
class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [permissions.IsAuthenticated, IsAdmin | IsAgent]
        else:
            permission_classes = [IsAdmin]
        return [permission() for permission in permission_classes]


# --- Pages d’accueil ---
def home(request):
    """Accueil global du backend (racine du site)."""
    return HttpResponse(
        "<h1>Bienvenue sur le Backend GSC</h1>"
        "<p>API REST en cours de développement.</p>"
    )


def api_root(request):
    """Accueil JSON de l’API (point d’entrée /api/)."""
    return JsonResponse({
        "status": "OK",
        "message": "Racine de l'API GSC"
    })


# --- Liste des clients ---
class ClientListView(generics.ListAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]


# --- Inscription utilisateur ---
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Génération automatique des tokens JWT
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "refresh": str(refresh),
                "access": access,
            },
            status=status.HTTP_201_CREATED
        )


# --- Liste des clients via fonction ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # ✅ Exige le token JWT
def clients_list(request):
    clients = Client.objects.all()
    serializer = ClientSerializer(clients, many=True)
    return Response(serializer.data)


class TravelTypeViewSet(viewsets.ModelViewSet):
    queryset = TravelType.objects.all()
    serializer_class = TravelTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]