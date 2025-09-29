from django.contrib import admin
from .models import Country, VisaType, RequiredDocument, VisaApplication

# Register your models here.
admin.site.register(Country)
admin.site.register(VisaType)
admin.site.register(RequiredDocument)
admin.site.register(VisaApplication)