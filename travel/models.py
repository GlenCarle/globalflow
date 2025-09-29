from django.db import models
from django.conf import settings
from core.models import Client

# Country model for destinations
class Country(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=3, unique=True)  # ISO 3166-1 alpha-3
    continent = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Pays"
        verbose_name_plural = "Pays"

# Visa Type model
class VisaType(models.Model):
    VISA_CATEGORIES = [
        ('tourism', 'Tourisme'),
        ('business', 'Affaires'),
        ('student', 'Étudiant'),
        ('work', 'Travail'),
        ('family', 'Regroupement familial'),
        ('transit', 'Transit'),
        ('medical', 'Médical'),
        ('journalist', 'Journaliste'),
        ('diplomatic', 'Diplomatique'),
        ('official', 'Officiel'),
        ('investor', 'Investisseur'),
        ('retirement', 'Retraité'),
        ('other', 'Autre'),
    ]

    ENTRY_TYPES = [
        ('single', 'Entrée unique'),
        ('double', 'Double entrée'),
        ('multiple', 'Entrées multiples'),
    ]

    name = models.CharField(max_length=100, verbose_name="Nom du visa")
    code = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name="Code du visa")
    category = models.CharField(max_length=20, choices=VISA_CATEGORIES, verbose_name="Catégorie")
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='visa_types', verbose_name="Pays")
    description = models.TextField(blank=True, verbose_name="Description")
    
    # Durée et validité
    min_duration_days = models.PositiveIntegerField(default=1, verbose_name="Durée minimale (jours)")
    max_duration_days = models.PositiveIntegerField(default=90, verbose_name="Durée maximale (jours)")
    validity_days = models.PositiveIntegerField(
        default=180,
        verbose_name="Validité du visa (jours)",
        help_text="Pendant combien de jours le visa est valide après émission"
    )
    entry_type = models.CharField(
        max_length=10,
        choices=ENTRY_TYPES,
        default='single',
        verbose_name="Type d'entrée"
    )
    
    # Délais et frais
    min_processing_days = models.PositiveIntegerField(default=5, verbose_name="Délai minimum de traitement (jours)")
    max_processing_days = models.PositiveIntegerField(default=30, verbose_name="Délai maximum de traitement (jours)")
    fees = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Frais de dossier"
    )
    service_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        verbose_name="Frais de service"
    )
    currency = models.CharField(max_length=3, default='EUR', verbose_name="Devise")
    
    # Exigences spécifiques
    is_evisa_available = models.BooleanField(default=False, verbose_name="e-Visa disponible")
    is_visa_on_arrival = models.BooleanField(default=False, verbose_name="Visa à l'arrivée")
    is_visa_waiver = models.BooleanField(default=False, verbose_name="Exemption de visa")
    
    # Documents requis
    requires_biometrics = models.BooleanField(default=False, verbose_name="Empreintes digitales requises")
    requires_medical_certificate = models.BooleanField(default=False, verbose_name="Certificat médical requis")
    requires_police_clearance = models.BooleanField(default=False, verbose_name="Casier judiciaire requis")
    requires_bank_statements = models.BooleanField(default=False, verbose_name="Relevés bancaires requis")
    requires_employment_letter = models.BooleanField(default=False, verbose_name="Lettre d'emploi requise")
    requires_hotel_booking = models.BooleanField(default=False, verbose_name="Réservation hôtelière requise")
    requires_flight_itinerary = models.BooleanField(default=False, verbose_name="Itinéraire de vol requis")
    requires_invitation_letter = models.BooleanField(default=False, verbose_name="Lettre d'invitation requise")
    requires_travel_insurance = models.BooleanField(default=False, verbose_name="Assurance voyage requise")
    
    # Métadonnées
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    is_featured = models.BooleanField(default=False, verbose_name="Mis en avant")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")

    def __str__(self):
        return f"{self.name} - {self.country.name}"

    class Meta:
        verbose_name = "Type de visa"
        verbose_name_plural = "Types de visa"
        unique_together = ['name', 'country']

# Required Document model
class RequiredDocument(models.Model):
    DOCUMENT_TYPES = [
        ('passport', 'Passeport'),
        ('photo', 'Photo d\'identité'),
        ('birth_certificate', 'Acte de naissance'),
        ('marriage_certificate', 'Acte de mariage'),
        ('bank_statement', 'Relevé bancaire'),
        ('employment_letter', 'Lettre d\'emploi'),
        ('university_letter', 'Lettre universitaire'),
        ('medical_certificate', 'Certificat médical'),
        ('police_clearance', 'Casier judiciaire'),
        ('hotel_booking', 'Réservation hôtel'),
        ('flight_itinerary', 'Itinéraire de vol'),
        ('invitation_letter', 'Lettre d\'invitation'),
        ('property_deed', 'Titre de propriété'),
        ('tax_certificate', 'Certificat fiscal'),
        ('other', 'Autre'),
    ]

    visa_type = models.ForeignKey(VisaType, on_delete=models.CASCADE, related_name='required_documents')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_mandatory = models.BooleanField(default=True)
    max_file_size_mb = models.PositiveIntegerField(default=10)
    allowed_formats = models.CharField(max_length=200, default='pdf,jpg,jpeg,png')

    def __str__(self):
        return f"{self.name} - {self.visa_type.name}"

    class Meta:
        verbose_name = "Document requis"
        verbose_name_plural = "Documents requis"

# Visa Application model
class VisaApplication(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('submitted', 'Soumis'),
        ('payment_pending', 'Paiement en attente'),
        ('payment_received', 'Paiement reçu'),
        ('under_review', 'En cours d\'examen'),
        ('additional_info_required', 'Informations complémentaires requises'),
        ('document_verification', 'Vérification des documents'),
        ('biometrics_required', 'Prise d\'empreintes requise'),
        ('interview_required', 'Entretien requis'),
        ('approved', 'Approuvé'),
        ('rejected', 'Refusé'),
        ('embassy_submitted', 'Soumis à l\'ambassade'),
        ('visa_processing', 'Traitement par les autorités'),
        ('visa_printed', 'Visa imprimé'),
        ('ready_for_pickup', 'Prêt à être retiré'),
        ('delivered', 'Livré'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('expired', 'Expiré'),
    ]

    PRIORITY_LEVELS = [
        ('normal', 'Normal'),
        ('express', 'Express (+50%)'),
        ('urgent', 'Urgent (+100%)'),
    ]

    # Basic information
    applicant = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='visa_applications', verbose_name="Demandeur")
    visa_type = models.ForeignKey(VisaType, on_delete=models.CASCADE, verbose_name="Type de visa")
    application_number = models.CharField(max_length=50, unique=True, blank=True, verbose_name="Numéro de demande")
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='normal', verbose_name="Priorité")
    
    # Personal information
    GENDER_CHOICES = [
        ('male', 'Homme'),
        ('female', 'Femme'),
        ('other', 'Autre'),
    ]
    
    # Personal details
    first_name = models.CharField(max_length=100, verbose_name="Prénom", default="")
    middle_name = models.CharField(max_length=100, blank=True, verbose_name="Deuxième prénom", default="")
    last_name = models.CharField(max_length=100, verbose_name="Nom", default="")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, verbose_name="Genre", default="other")
    date_of_birth = models.DateField(verbose_name="Date de naissance", null=True, blank=True)
    place_of_birth = models.CharField(max_length=100, verbose_name="Lieu de naissance", default="")
    country_of_birth = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True, related_name='birth_applications', verbose_name="Pays de naissance")
    nationality = models.CharField(max_length=100, verbose_name="Nationalité", default="")
    other_nationality = models.CharField(max_length=100, blank=True, verbose_name="Autre nationalité", default="")
    
    # Contact information
    current_address = models.TextField(verbose_name="Adresse actuelle", default="")
    city = models.CharField(max_length=100, verbose_name="Ville", default="")
    state = models.CharField(max_length=100, blank=True, verbose_name="État/Région", default="")
    postal_code = models.CharField(max_length=20, verbose_name="Code postal", default="")
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True, related_name='residence_applications', verbose_name="Pays de résidence")
    phone_number = models.CharField(max_length=20, verbose_name="Téléphone", default="")
    alternate_phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone secondaire", default="")
    email = models.EmailField(verbose_name="Email", default="")
    
    # Passport information
    passport_number = models.CharField(max_length=50, verbose_name="Numéro de passeport", default="")
    passport_issue_date = models.DateField(verbose_name="Date d'émission", null=True, blank=True)
    passport_expiry_date = models.DateField(verbose_name="Date d'expiration", null=True, blank=True)
    passport_issue_place = models.CharField(max_length=100, verbose_name="Lieu d'émission", default="")
    passport_issue_country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True, related_name='passport_issue_applications', verbose_name="Pays d'émission")
    
    # Marital status and family
    MARITAL_STATUS_CHOICES = [
        ('single', 'Célibataire'),
        ('married', 'Marié(e)'),
        ('divorced', 'Divorcé(e)'),
        ('widowed', 'Veuf/Veuve'),
        ('separated', 'Séparé(e)'),
        ('domestic_partnership', 'Union libre'),
    ]
    
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, default='single', verbose_name="État civil")
    spouse_name = models.CharField(max_length=200, blank=True, verbose_name="Nom du conjoint", default="")
    spouse_nationality = models.CharField(max_length=100, blank=True, verbose_name="Nationalité du conjoint", default="")
    spouse_passport_number = models.CharField(max_length=50, blank=True, verbose_name="Passeport du conjoint", default="")
    number_of_children = models.PositiveIntegerField(default=0, verbose_name="Nombre d'enfants")
    
    # Travel information
    purpose_of_visit = models.TextField(verbose_name="Motif du voyage", default="")
    intended_date_of_arrival = models.DateField(verbose_name="Date d'arrivée prévue", null=True, blank=True)
    intended_date_of_departure = models.DateField(verbose_name="Date de départ prévue", null=True, blank=True)
    length_of_stay_days = models.PositiveIntegerField(verbose_name="Durée du séjour (jours)", null=True, blank=True)
    entry_port = models.CharField(max_length=100, blank=True, verbose_name="Point d'entrée", default="")
    
    # Accommodation details
    ACCOMMODATION_TYPES = [
        ('hotel', 'Hôtel'),
        ('friends_family', 'Famille/Amis'),
        ('rental', 'Location'),
        ('other', 'Autre'),
    ]
    
    accommodation_type = models.CharField(max_length=20, choices=ACCOMMODATION_TYPES, blank=True, verbose_name="Type d'hébergement")
    accommodation_name = models.CharField(max_length=200, blank=True, verbose_name="Nom de l'hébergement")
    accommodation_address = models.TextField(blank=True, verbose_name="Adresse de l'hébergement")
    accommodation_contact = models.CharField(max_length=100, blank=True, verbose_name="Contact sur place")
    accommodation_phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone de l'hébergement")
    
    # Employment/Education
    OCCUPATION_TYPES = [
        ('employed', 'Employé(e)'),
        ('self_employed', 'Indépendant(e)'),
        ('student', 'Étudiant(e)'),
        ('retired', 'Retraité(e)'),
        ('unemployed', 'Sans emploi'),
        ('other', 'Autre'),
    ]
    
    occupation_type = models.CharField(max_length=20, choices=OCCUPATION_TYPES, default='other', verbose_name="Statut professionnel")
    occupation = models.CharField(max_length=100, verbose_name="Profession", default="")
    employer_name = models.CharField(max_length=200, blank=True, verbose_name="Nom de l'employeur", default="")
    employer_address = models.TextField(blank=True, verbose_name="Adresse de l'employeur", default="")
    employer_phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone de l'employeur", default="")
    job_title = models.CharField(max_length=100, blank=True, verbose_name="Poste occupé", default="")
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Revenu mensuel")
    
    # Education
    EDUCATION_LEVELS = [
        ('primary', 'École primaire'),
        ('secondary', 'École secondaire'),
        ('high_school', 'Lycée'),
        ('bachelor', 'Licence'),
        ('master', 'Master'),
        ('phd', 'Doctorat'),
        ('other', 'Autre'),
    ]
    
    education_level = models.CharField(max_length=20, choices=EDUCATION_LEVELS, blank=True, verbose_name="Niveau d'études")
    education_field = models.CharField(max_length=100, blank=True, verbose_name="Domaine d'études")
    institution_name = models.CharField(max_length=200, blank=True, verbose_name="Établissement")
    
    # Travel history
    has_visited_before = models.BooleanField(default=False, verbose_name="A déjà visité le pays")
    previous_visa_refusals = models.BooleanField(default=False, verbose_name="Refus de visa antérieur")
    refusal_details = models.TextField(blank=True, verbose_name="Détails des refus")
    criminal_record = models.BooleanField(default=False, verbose_name="Antécédents judiciaires")
    criminal_record_details = models.TextField(blank=True, verbose_name="Détails des antécédents")
    
    # Emergency contact
    emergency_contact_name = models.CharField(max_length=200, verbose_name="Contact d'urgence", default="")
    emergency_relationship = models.CharField(max_length=50, verbose_name="Lien de parenté", default="")
    emergency_phone = models.CharField(max_length=20, verbose_name="Téléphone d'urgence", default="")
    emergency_email = models.EmailField(blank=True, verbose_name="Email d'urgence", default="")
    emergency_address = models.TextField(verbose_name="Adresse du contact d'urgence", default="")
    
    # Status and tracking
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft', verbose_name="Statut")
    current_step = models.PositiveIntegerField(default=1, verbose_name="Étape en cours")
    
    # Timestamps
    submitted_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de soumission")
    payment_received_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de paiement")
    under_review_at = models.DateTimeField(null=True, blank=True, verbose_name="Début de l'examen")
    additional_info_requested_at = models.DateTimeField(null=True, blank=True, verbose_name="Demande d'information")
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'approbation")
    rejected_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de rejet")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de finalisation")
    
    # Agent and notes
    assigned_agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, 
                                     related_name='assigned_applications', verbose_name="Agent assigné")
    internal_notes = models.TextField(blank=True, verbose_name="Notes internes")
    rejection_reason = models.TextField(blank=True, verbose_name="Motif du rejet")
    
    # Financial
    application_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Frais de dossier")
    processing_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Frais de traitement")
    express_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Frais express")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Montant total")
    payment_method = models.CharField(max_length=50, blank=True, verbose_name="Méthode de paiement")
    payment_status = models.CharField(max_length=20, default='pending', verbose_name="Statut du paiement")
    payment_reference = models.CharField(max_length=100, blank=True, verbose_name="Référence de paiement")
    
    # Additional fields
    is_self_application = models.BooleanField(default=True, verbose_name="Démarche personnelle")
    representative_name = models.CharField(max_length=200, blank=True, verbose_name="Nom du représentant")
    representative_contact = models.CharField(max_length=100, blank=True, verbose_name="Contact du représentant")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Dernière mise à jour")

    def save(self, *args, **kwargs):
        if not self.application_number and self.status != 'draft':
            # Generate application number
            import uuid
            self.application_number = f"VA-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.applicant} - {self.visa_type} - {self.get_status_display()}"

    class Meta:
        verbose_name = "Demande de visa"
        verbose_name_plural = "Demandes de visa"
        ordering = ['-created_at']

# Application Document model
class ApplicationDocument(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('submitted', 'Soumis'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
        ('revision_required', 'Révision requise'),
    ]

    application = models.ForeignKey(VisaApplication, on_delete=models.CASCADE, related_name='documents')
    required_document = models.ForeignKey(RequiredDocument, on_delete=models.CASCADE, null=True, blank=True)
    file = models.FileField(upload_to='visa_documents/', null=True, blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewer_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.application} - {self.required_document.name}"

    class Meta:
        verbose_name = "Document de demande"
        verbose_name_plural = "Documents de demande"
        unique_together = ['application', 'required_document']

# Application History model
class ApplicationHistory(models.Model):
    ACTION_CHOICES = [
        ('created', 'Créé'),
        ('submitted', 'Soumis'),
        ('status_changed', 'Statut modifié'),
        ('document_uploaded', 'Document téléversé'),
        ('document_reviewed', 'Document examiné'),
        ('notes_added', 'Notes ajoutées'),
        ('assigned', 'Assigné à un agent'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
    ]

    application = models.ForeignKey(VisaApplication, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    old_status = models.CharField(max_length=30, blank=True)
    new_status = models.CharField(max_length=30, blank=True)
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    performed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.application} - {self.get_action_display()} - {self.performed_at}"

    class Meta:
        verbose_name = "Historique de demande"
        verbose_name_plural = "Historiques de demande"
        ordering = ['-performed_at']

# Legacy models (keeping for backward compatibility)
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
    statut = models.CharField(max_length=30, default="en_cours")
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

class TravelBooking(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('pending_payment', 'En attente de paiement'),
        ('processing', 'En cours de traitement'),
        ('payment_validated', 'Paiement validé'),
        ('pending_agent_validation', 'En attente de validation agent'),
        ('confirmed', 'Confirmée'),
        ('ticket_sent', 'Billet envoyé'),
        ('cancelled', 'Annulée'),
    ]
    user = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='travel_bookings')
    destination = models.CharField(max_length=100)
    ville_depart = models.CharField(max_length=100)
    ville_arrivee = models.CharField(max_length=100)
    aller_retour = models.BooleanField(default=False)
    date_depart = models.DateField()
    date_retour = models.DateField(null=True, blank=True)
    travel_class = models.CharField(max_length=20, choices=[('economy', 'Économique'), ('business', 'Business'), ('first', 'Première')], default='economy')
    nombre_passagers = models.PositiveIntegerField(default=1)
    statut = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')

    # Draft data stored as JSON for temporary form state
    draft_form_data = models.JSONField(null=True, blank=True, verbose_name="Données du formulaire (brouillon)")
    draft_passengers = models.JSONField(null=True, blank=True, verbose_name="Passagers (brouillon)")
    draft_documents = models.JSONField(null=True, blank=True, verbose_name="Documents (brouillon)")

    billet_pdf = models.FileField(upload_to='billets/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    visa_application = models.ForeignKey('VisaApplication', on_delete=models.SET_NULL, null=True, blank=True)

    # Durée de procédure (en jours)
    procedure_duration_days = models.PositiveIntegerField(default=0, verbose_name="Durée de procédure (jours)")
    procedure_start_date = models.DateTimeField(null=True, blank=True, verbose_name="Date début procédure")
    procedure_end_date = models.DateTimeField(null=True, blank=True, verbose_name="Date fin procédure")
    assigned_agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
                                      related_name='assigned_bookings', verbose_name="Agent assigné")

    def __str__(self):
        return f"{self.user} - {self.destination} - {self.get_statut_display()}"

class Passenger(models.Model):
    booking = models.ForeignKey(TravelBooking, on_delete=models.CASCADE, related_name='passengers')
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    sexe = models.CharField(max_length=10, choices=[('male', 'Homme'), ('female', 'Femme'), ('other', 'Autre')])
    nationalite = models.CharField(max_length=100)
    numero_passeport = models.CharField(max_length=50)
    expiration_passeport = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} {self.prenom} ({self.numero_passeport})"

class TravelDocument(models.Model):
    DOCUMENT_TYPES = [
        ('passport', 'Passeport'),
        ('visa', 'Visa'),
        ('other', 'Autre'),
    ]
    booking = models.ForeignKey(TravelBooking, on_delete=models.CASCADE, related_name='documents')
    type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    fichier = models.FileField(upload_to='travel_documents/')
    statut = models.CharField(max_length=20, choices=[('pending', 'En attente'), ('approved', 'Approuvé'), ('rejected', 'Rejeté')], default='pending')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.booking}"

class BookingStatusHistory(models.Model):
    booking = models.ForeignKey(TravelBooking, on_delete=models.CASCADE, related_name='status_history')
    statut = models.CharField(max_length=30)
    date = models.DateTimeField(auto_now_add=True)
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.booking} - {self.statut} - {self.date}"

class Payment(models.Model):
    PAYMENT_TYPES = [
        ('travel_booking', 'Réservation de vol'),
        ('visa_application', 'Demande de visa'),
        ('service', 'Service'),
    ]

    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('processing', 'En cours'),
        ('completed', 'Terminé'),
        ('failed', 'Échec'),
        ('cancelled', 'Annulé'),
        ('refunded', 'Remboursé'),
    ]

    PAYMENT_METHODS = [
        ('card', 'Carte bancaire'),
        ('bank_transfer', 'Virement bancaire'),
        ('paypal', 'PayPal'),
        ('cash', 'Espèces'),
        ('mobile_money', 'Mobile Money'),
    ]

    user = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments', verbose_name="Utilisateur")
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES, verbose_name="Type de paiement")
    reference = models.CharField(max_length=100, unique=True, verbose_name="Référence de paiement")

    # Related objects
    travel_booking = models.ForeignKey(TravelBooking, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    visa_application = models.ForeignKey(VisaApplication, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')

    # Amount and currency
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant")
    currency = models.CharField(max_length=3, default='EUR', verbose_name="Devise")

    # Payment details
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, verbose_name="Méthode de paiement")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Statut")

    # Transaction details
    transaction_id = models.CharField(max_length=100, blank=True, verbose_name="ID de transaction")
    payment_gateway = models.CharField(max_length=50, blank=True, verbose_name="Passerelle de paiement")

    # Card details (masked for security)
    card_last_four = models.CharField(max_length=4, blank=True, verbose_name="4 derniers chiffres")
    card_brand = models.CharField(max_length=20, blank=True, verbose_name="Marque de carte")

    # Timestamps
    initiated_at = models.DateTimeField(auto_now_add=True, verbose_name="Date d'initiation")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de completion")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Dernière mise à jour")

    # Additional info
    description = models.TextField(blank=True, verbose_name="Description")
    notes = models.TextField(blank=True, verbose_name="Notes")

    def __str__(self):
        return f"{self.reference} - {self.amount} {self.currency} - {self.get_status_display()}"

    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ['-initiated_at']

# Appointment model
class Appointment(models.Model):
    REASON_CHOICES = [
        ('visa', 'Demande de visa'),
        ('booking', 'Réservation de voyage'),
        ('other', 'Autre'),
    ]

    STATUS_CHOICES = [
        ('unread', 'Non lu'),
        ('read', 'Lu'),
        ('canceled', 'Annulé'),
        ('postponed', 'Reporté'),
    ]

    LOCATION_CHOICES = [
        ('agency', 'Agence'),
        ('embassy', 'Ambassade'),
    ]

    # Documents required based on reason
    DOCUMENTS_BY_REASON = {
        'visa': [
            'passport', 'photo', 'birth_certificate', 'marriage_certificate',
            'bank_statement', 'employment_letter', 'medical_certificate', 'police_clearance'
        ],
        'booking': [
            'passport', 'flight_itinerary', 'hotel_booking'
        ],
        'other': []
    }

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='appointments', verbose_name="Client")
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_appointments', verbose_name="Agent")
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, verbose_name="Motif")
    date = models.DateTimeField(verbose_name="Date du rendez-vous")
    message = models.TextField(verbose_name="Message pour le client")
    location = models.CharField(max_length=20, choices=LOCATION_CHOICES, verbose_name="Lieu")
    required_documents = models.JSONField(default=list, verbose_name="Documents requis")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unread', verbose_name="Statut")
    new_date = models.DateTimeField(null=True, blank=True, verbose_name="Nouvelle date (si reporté)")

    # Related objects (optional)
    visa_application = models.ForeignKey(VisaApplication, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    travel_booking = models.ForeignKey(TravelBooking, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Dernière mise à jour")

    def save(self, *args, **kwargs):
        # Set required documents based on reason if not set
        if not self.required_documents:
            self.required_documents = self.DOCUMENTS_BY_REASON.get(self.reason, [])
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Rendez-vous {self.client} - {self.get_reason_display()} - {self.date}"

    class Meta:
        verbose_name = "Rendez-vous"
        verbose_name_plural = "Rendez-vous"
        ordering = ['-date']
