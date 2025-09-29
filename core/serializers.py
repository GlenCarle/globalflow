from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Client, Profile, TravelType, Document
from django.conf import settings
import os


# Serializer pour le modèle Client
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"


# Serializer pour l'inscription utilisateur
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(required=False, default='client')
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    profile = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name",
                  "role", "phone", "address", "city", "country", "profile"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur existe déjà.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def create(self, validated_data):
        # Extraire les données du profil
        role = validated_data.pop('role', 'client')
        phone = validated_data.pop('phone', '')
        address = validated_data.pop('address', '')
        city = validated_data.pop('city', '')
        country = validated_data.pop('country', '')
        
        # Création utilisateur avec hash du mot de passe
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", "")
        )
        
        # Mise à jour du profil existant (créé par le signal post_save)
        try:
            profile = Profile.objects.get(user=user)
            profile.role = role
            profile.phone = phone
            profile.address = address
            profile.city = city
            profile.country = country
            profile.save()
        except Profile.DoesNotExist:
            # Si pour une raison quelconque le profil n'a pas été créé par le signal
            Profile.objects.create(
                user=user,
                role=role,
                phone=phone,
                address=address,
                city=city,
                country=country
            )
        
        return user

    def get_profile(self, obj):
        if hasattr(obj, "profile"):
            return {
                "role": obj.profile.role,
                "phone": obj.profile.phone,
                "address": obj.profile.address,
                "city": obj.profile.city,
                "country": obj.profile.country
            }
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


class ProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    username = serializers.CharField(source='user.username', read_only=True)
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role',
                  'profile_picture', 'profile_picture_url', 'phone', 'address',
                  'city', 'country', 'bio']
        extra_kwargs = {
            'profile_picture': {'write_only': True}
        }

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        
        # Mettre à jour les champs de l'utilisateur
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        # Mettre à jour les champs du profil
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance