from rest_framework import serializers
from .models import DossierVoyage, DocumentVoyage

class DocumentVoyageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentVoyage
        fields = "__all__"

class DossierVoyageSerializer(serializers.ModelSerializer):
    documents = DocumentVoyageSerializer(many=True, read_only=True)

    class Meta:
        model = DossierVoyage
        fields = "__all__"
