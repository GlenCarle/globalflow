from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
# Create your models here.

class Client(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=20)
    type_piece = models.CharField(max_length=50, help_text="Type de pièce d'identité")
    numero_piece = models.CharField(max_length=50, unique=True)
    date_naissance = models.DateField(null=True, blank=True)
    pays = models.CharField(max_length=50, default="Cameroun")

    def __str__(self):
        return f"{self.prenom} {self.nom} - {self.email}"
    

class Profile(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Administrateur'),
        ('agent', 'Agent'),
        ('client', 'Client'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
    

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance, role='client')  # rôle par défaut

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class TravelType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Document(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name