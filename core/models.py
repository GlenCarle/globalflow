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
    numero_piece = models.CharField(max_length=50, unique=True, null=True, blank=True)
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
    client = models.OneToOneField(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='profile')
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
    

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Create profile with default role
        profile = Profile.objects.create(user=instance, role='client')

        # If role is client, create associated Client instance
        if profile.role == 'client':
            client = Client.objects.create(
                nom=instance.last_name,
                prenom=instance.first_name,
                email=instance.email,
                telephone='',  # Will be filled later
                type_piece='',
                numero_piece=None,
            )
            profile.client = client
            profile.save()

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