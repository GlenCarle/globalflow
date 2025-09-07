from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
from core.models import Client  # déjà existant

class VoyageType(models.TextChoices):
    ETUDES = "ETUDES", "Études"
    TRAVAIL = "TRAVAIL", "Travail"
    TOURISME = "TOURISME", "Tourisme"
    PELERINAGE = "PELERINAGE", "Pèlerinage"

class DossierVoyage(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="dossiers")
    type_voyage = models.CharField(max_length=20, choices=VoyageType.choices)
    destination = models.CharField(max_length=100)
    date_depart = models.DateField(null=True, blank=True)
    date_retour = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=30, default="en_cours")  # en_cours, approuvé, refusé, clos
    cree_par = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client} - {self.type_voyage} - {self.destination}"

class DocumentType(models.TextChoices):
    PASSEPORT = "PASSEPORT", "Passeport"
    VISA = "VISA", "Visa"
    BILLET = "BILLET", "Billet"
    ASSURANCE = "ASSURANCE", "Assurance"

class DocumentVoyage(models.Model):
    dossier = models.ForeignKey(DossierVoyage, on_delete=models.CASCADE, related_name="documents")
    type_document = models.CharField(max_length=20, choices=DocumentType.choices)
    numero = models.CharField(max_length=100, blank=True)
    date_expiration = models.DateField(null=True, blank=True)
    fichier = models.FileField(upload_to="documents/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
