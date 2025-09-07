from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Client, TravelType, Document

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('prenom', 'nom', 'email', 'telephone', 'type_piece', 'numero_piece', 'pays')
    search_fields = ('nom', 'prenom', 'email', 'numero_piece')


@admin.register(TravelType)
class TravelTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)
    ordering = ("name",)