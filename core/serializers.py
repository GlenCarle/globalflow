from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Client, Profile, TravelType, Document


# Serializer pour le modèle Client
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"


# Serializer pour l'inscription utilisateur
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=False, allow_blank=True)
    profile = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "profile"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d’utilisateur existe déjà.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def create(self, validated_data):
        # Création utilisateur avec hash du mot de passe
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"]
        )
        # Création du profil si inexistant
        Profile.objects.get_or_create(user=user, defaults={"role": "user"})
        return user

    def get_profile(self, obj):
        if hasattr(obj, "profile"):
            return {"role": obj.profile.role}
        return {"role": None}

    def to_representation(self, instance):
        """Ajout automatique des tokens JWT dans la réponse"""
        refresh = RefreshToken.for_user(instance)
        data = super().to_representation(instance)
        data["tokens"] = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        return data

class TravelTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelType
        fields = "__all__"


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"