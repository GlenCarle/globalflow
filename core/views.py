from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

# Django REST Framework
from rest_framework import viewsets, generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

# SimpleJWT
from rest_framework_simplejwt.tokens import RefreshToken

from django.core.paginator import Paginator
from .models import Client, Profile, Document, TravelType
from travel.models import VisaApplication as Request
from travel.serializers import VisaApplicationSerializer as RequestSerializer
from .serializers import (
    ClientSerializer, ProfileSerializer, RegisterSerializer,
    TravelTypeSerializer, DocumentSerializer
)
from .permissions import IsAdmin, IsAgent


# --- API Clients ---
class ClientViewSet(viewsets.ModelViewSet):   # vIEW QUI PERMET DE GERER LES CLIENTS
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
        print("Données reçues:", request.data)  # Pour le débogage
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            print("Erreurs de validation:", serializer.errors)  # Pour le débogage
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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


class AgentClientListView(APIView):
    permission_classes = [IsAuthenticated, IsAgent]
    
    def get(self, request):
        # Get query parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        status_filter = request.query_params.get('status', '')
        search = request.query_params.get('search', '')
        
        # Base queryset
        queryset = Client.objects.all()
        
        # Apply filters
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
            
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(phone_number__icontains=search)
            )
        
        # Pagination
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        
        serializer = ClientSerializer(page_obj, many=True)
        
        return Response({
            'items': serializer.data,
            'total': paginator.count,
            'page': page,
            'total_pages': paginator.num_pages,
        })


class AgentRequestListView(APIView):
    permission_classes = [IsAuthenticated, IsAgent]
    
    def get(self, request):
        # Get query parameters
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        status_filter = request.query_params.get('status', '')
        search = request.query_params.get('search', '')
        
        # Base queryset with correct relationship path
        queryset = Request.objects.select_related('applicant__profile__user')
        
        # Apply filters
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
            
        if search:
            queryset = queryset.filter(
                Q(applicant__profile__user__first_name__icontains=search) |
                Q(applicant__profile__user__last_name__icontains=search) |
                Q(applicant__profile__user__email__icontains=search) |
                Q(visa_type__name__icontains=search)
            )
        
        # Order by most recent first
        queryset = queryset.order_by('-created_at')
        
        # Pagination
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        
        serializer = RequestSerializer(page_obj, many=True)
        
        return Response({
            'items': serializer.data,
            'total': paginator.count,
            'page': page,
            'total_pages': paginator.num_pages,
        })


# --- User Info ---
class UserProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            if not user or not user.is_authenticated:
                return Response(
                    {'error': 'Utilisateur non authentifié'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Récupérer le profil de l'utilisateur
            profile = Profile.objects.get(user=user)
            serializer = ProfileSerializer(profile)
            
            print("Données du profil:", serializer.data)

            return Response(serializer.data)
            
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profil utilisateur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def put(self, request):
        try:
            user = request.user
            if not user or not user.is_authenticated:
                return Response(
                    {'error': 'Utilisateur non authentifié'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Récupérer le profil de l'utilisateur
            profile = Profile.objects.get(user=user)
            
            # Utiliser le sérialiseur pour valider et mettre à jour les données
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profil utilisateur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# --- Upload Profile Picture ---
class ProfilePictureUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            if not user or not user.is_authenticated:
                return Response(
                    {'error': 'Utilisateur non authentifié'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Récupérer le profil de l'utilisateur
            profile = Profile.objects.get(user=user)
            
            # Vérifier si une image a été fournie
            if 'profile_picture' not in request.FILES:
                return Response(
                    {'error': 'Aucune image fournie'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Supprimer l'ancienne image si elle existe
            if profile.profile_picture:
                profile.profile_picture.delete()
            
            # Enregistrer la nouvelle image
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()
            
            # Retourner les données du profil mises à jour
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
            
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profil utilisateur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )