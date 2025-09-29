from django.utils import timezone
from rest_framework import serializers
from .models import (
    Country, VisaType, RequiredDocument, VisaApplication,
    ApplicationDocument, ApplicationHistory,
    DossierVoyage, DocumentVoyage,
    TravelBooking, Passenger, TravelDocument, BookingStatusHistory, Payment, Appointment
)

# Country Serializer
class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'

# Visa Type Serializer
class VisaTypeSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)
    required_documents_count = serializers.SerializerMethodField()
    
    # Champs calculés pour la compatibilité
    processing_time_days = serializers.SerializerMethodField()
    fees = serializers.DecimalField(source='service_fee', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = VisaType
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
        
    def get_processing_time_days(self, obj):
        # Retourne une estimation du temps de traitement
        if obj.min_processing_days and obj.max_processing_days:
            if obj.min_processing_days == obj.max_processing_days:
                return f"{obj.min_processing_days} jours"
            return f"{obj.min_processing_days}-{obj.max_processing_days} jours"
        return None

    def get_required_documents_count(self, obj):
        return obj.required_documents.count()

# Required Document Serializer
class RequiredDocumentSerializer(serializers.ModelSerializer):
    visa_type_name = serializers.CharField(source='visa_type.name', read_only=True)

    class Meta:
        model = RequiredDocument
        fields = '__all__'

# Application Document Serializer
class ApplicationDocumentSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source='required_document.name', read_only=True)
    document_type = serializers.CharField(source='required_document.document_type', read_only=True)
    is_mandatory = serializers.BooleanField(source='required_document.is_mandatory', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationDocument
        fields = '__all__'
        read_only_fields = ['uploaded_at', 'reviewed_at']
        extra_kwargs = {
            'required_document': {'required': False},
        }

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None

# Application History Serializer
class ApplicationHistorySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)

    class Meta:
        model = ApplicationHistory
        fields = '__all__'

# Visa Application Serializer
class VisaApplicationSerializer(serializers.ModelSerializer):
    visa_type_name = serializers.CharField(source='visa_type.name', read_only=True)
    country_name = serializers.CharField(source='visa_type.country.name', read_only=True)
    applicant_name = serializers.SerializerMethodField()
    assigned_agent_name = serializers.SerializerMethodField()
    documents = ApplicationDocumentSerializer(many=True, read_only=True)
    recent_history = ApplicationHistorySerializer(source='history', many=True, read_only=True)
    
    # Champs calculés
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    
    # Champs imbriqués
    country_of_birth_name = serializers.CharField(source='country_of_birth.name', read_only=True)
    residence_country_name = serializers.CharField(source='country.name', read_only=True)
    passport_issue_country_name = serializers.CharField(source='passport_issue_country.name', read_only=True)
    
    # Champs pour la compatibilité
    processing_fee = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='application_fee')
    
    class Meta:
        model = VisaApplication
        fields = '__all__'
        read_only_fields = [
            'application_number', 'submitted_at', 'reviewed_at',
            'approved_at', 'rejected_at', 'created_at', 'updated_at',
            'under_review_at', 'additional_info_requested_at', 'completed_at',
            'payment_received_at'
        ]
        extra_kwargs = {
            'user': {'required': False},
            'applicant': {'required': False},
        }
    
    def get_assigned_agent_name(self, obj):
        if obj.assigned_agent:
            return obj.assigned_agent.get_full_name()
        return None

    def get_full_name(self, obj):
        names = [obj.first_name or '']
        if obj.middle_name:
            names.append(obj.middle_name)
        names.append(obj.last_name or '')
        return ' '.join(filter(None, names))
        
    def get_applicant_name(self, obj):
        return self.get_full_name(obj)
        
    def get_age(self, obj):
        if obj.date_of_birth:
            today = timezone.now().date()
            return today.year - obj.date_of_birth.year - ((today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day))
        return None

# Visa Application Create/Update Serializer (for draft saving)
class VisaApplicationDraftSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make applicant not required - it will be set in the view
        self.fields['applicant'].required = False

    def create(self, validated_data):
        # Ensure applicant is set before creating
        if 'applicant' not in validated_data or not validated_data['applicant']:
            # This should be handled in the view's perform_create method
            # But as a fallback, raise an error
            raise serializers.ValidationError({'applicant': 'Demandeur requis'})

        return super().create(validated_data)

    class Meta:
        model = VisaApplication
        fields = '__all__'
        read_only_fields = [
            'application_number', 'submitted_at', 'reviewed_at',
            'approved_at', 'rejected_at', 'created_at', 'updated_at',
            'under_review_at', 'additional_info_requested_at', 'completed_at',
            'payment_received_at', 'payment_status', 'payment_reference'
        ]
        extra_kwargs = {
            'user': {'required': False},
            'applicant': {'required': False},  # Will be set in view
        }

# Visa Application List Serializer (for dashboard)
class VisaApplicationListSerializer(serializers.ModelSerializer):
    visa_type_name = serializers.CharField(source='visa_type.name', read_only=True)
    country_name = serializers.CharField(source='visa_type.country.name', read_only=True)
    applicant_name = serializers.SerializerMethodField()
    days_since_created = serializers.SerializerMethodField()
    documents_completed = serializers.SerializerMethodField()
    total_documents = serializers.SerializerMethodField()
    
    # Champs additionnels pour le tableau de bord
    full_name = serializers.SerializerMethodField()
    nationality = serializers.CharField(read_only=True)
    purpose = serializers.CharField(source='purpose_of_visit', read_only=True)
    travel_dates = serializers.SerializerMethodField()
    completeness_percentage = serializers.SerializerMethodField()
    missing_documents = serializers.SerializerMethodField()
    is_complete = serializers.SerializerMethodField()
    
    # Champs de statut
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    # Champs de paiement
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = VisaApplication
        fields = [
            'id', 'application_number', 'status', 'status_display', 'priority', 'priority_display',
            'visa_type', 'visa_type_name', 'country_name', 'applicant_name', 'full_name',
            'nationality', 'purpose', 'travel_dates', 'created_at', 'updated_at',
            'documents_completed', 'total_documents', 'completeness_percentage', 'is_complete', 'missing_documents',
            'days_since_created', 'payment_status', 'payment_status_display', 'total_amount', 'assigned_agent'
        ]
        read_only_fields = ['application_number', 'created_at', 'updated_at']

    def get_applicant_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

    def get_days_since_created(self, obj):
        from django.utils import timezone
        return (timezone.now().date() - obj.created_at.date()).days if obj.created_at else 0

    def get_full_name(self, obj):
        names = [obj.first_name or '']
        if obj.middle_name:
            names.append(obj.middle_name)
        names.append(obj.last_name or '')
        return ' '.join(filter(None, names))

    def get_travel_dates(self, obj):
        if obj.intended_date_of_arrival and obj.intended_date_of_departure:
            return f"{obj.intended_date_of_arrival.strftime('%d/%m/%Y')} - {obj.intended_date_of_departure.strftime('%d/%m/%Y')}"
        return None

    def get_total_amount(self, obj):
        if obj.total_amount:
            return f"{obj.total_amount} {obj.visa_type.currency if obj.visa_type else 'USD'}"
        return None

    def get_documents_completed(self, obj):
        return obj.documents.filter(status__in=['submitted', 'approved']).count()

    def get_total_documents(self, obj):
        return obj.documents.count()

    def get_completeness_percentage(self, obj):
        """Calculate application completeness percentage based on all required fields and documents"""
        if not hasattr(obj, 'visa_type') or not obj.visa_type:
            return 0
            
        # Define required fields for each section
        required_fields = {
            # Personal Information (30% weight)
            'personal_info': [
                'first_name', 'last_name', 'gender', 'date_of_birth',
                'place_of_birth', 'nationality', 'marital_status'
            ],
            # Contact Information (20% weight)
            'contact_info': [
                'current_address', 'city', 'postal_code', 'country',
                'phone_number', 'email'
            ],
            # Passport Information (15% weight)
            'passport_info': [
                'passport_number', 'passport_issue_date',
                'passport_expiry_date', 'passport_issue_country'
            ],
            # Travel Information (15% weight)
            'travel_info': [
                'purpose_of_visit', 'intended_date_of_arrival',
                'intended_date_of_departure', 'length_of_stay_days'
            ],
            # Employment/Education (10% weight)
            'employment_education': [
                'occupation_type', 'occupation'
            ],
            # Emergency Contact (10% weight)
            'emergency_contact': [
                'emergency_contact_name', 'emergency_relationship',
                'emergency_phone'
            ]
        }
        
        # Calculate completion for each section
        section_weights = {
            'personal_info': 30,
            'contact_info': 20,
            'passport_info': 15,
            'travel_info': 15,
            'employment_education': 10,
            'emergency_contact': 10
        }
        
        total_percentage = 0
        
        # Check each section
        for section, fields in required_fields.items():
            completed_fields = 0
            for field in fields:
                value = getattr(obj, field, None)
                # Check if field has a value (not None, not empty string, not empty list, etc.)
                if value is not None and value != '' and value != [] and value != {}:
                    completed_fields += 1
            
            # Calculate section completion (0-100%)
            section_completion = (completed_fields / len(fields)) * 100 if fields else 0
            # Add weighted section score to total
            total_percentage += (section_completion * section_weights[section]) / 100
        
        # Check documents (20% weight)
        if hasattr(obj, 'visa_type') and obj.visa_type:
            total_docs = obj.visa_type.required_documents.count()
            if total_docs > 0:
                completed_docs = obj.documents.filter(
                    file__isnull=False,
                    status__in=['submitted', 'approved']
                ).count()
                doc_completion = (completed_docs / total_docs) * 20  # 20% weight
                total_percentage += doc_completion
        
        # Ensure percentage is between 0 and 100
        return min(100, int(round(total_percentage, 0)))

    def get_is_complete(self, obj):
        """Check if application has all required documents"""
        if not hasattr(obj, 'visa_type') or not obj.visa_type:
            return False
            
        mandatory_docs = obj.visa_type.required_documents.filter(is_mandatory=True)
        if not mandatory_docs.exists():
            return False  # If no mandatory docs are set up, consider it incomplete

        # Check if all mandatory documents are uploaded and approved
        completed_mandatory = obj.documents.filter(
            required_document__in=mandatory_docs,
            file__isnull=False,
            status__in=['submitted', 'approved']
        ).count()

        return completed_mandatory >= mandatory_docs.count()

    def get_missing_documents(self, obj):
        """Get list of missing required documents"""
        if not hasattr(obj, 'visa_type') or not obj.visa_type:
            return []
            
        required_docs = obj.visa_type.required_documents.all()
        if not required_docs.exists():
            return []
            
        uploaded_docs = obj.documents.filter(
            file__isnull=False,
            status__in=['submitted', 'approved']
        ).values_list('required_document_id', flat=True)

        missing = []
        for req_doc in required_docs:
            if req_doc.id not in uploaded_docs:
                missing.append({
                    'id': req_doc.id,
                    'name': req_doc.name,
                    'is_mandatory': req_doc.is_mandatory,
                    'document_type': getattr(req_doc, 'document_type', 'other')
                })

        return missing

# Legacy serializers (keeping for backward compatibility)
class DocumentVoyageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentVoyage
        fields = "__all__"

class DossierVoyageSerializer(serializers.ModelSerializer):
    documents = DocumentVoyageSerializer(many=True, read_only=True)

    class Meta:
        model = DossierVoyage
        fields = "__all__"

# --- Serializers for Travel Booking Module ---

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class TravelDocumentSerializer(serializers.ModelSerializer):
    fichier_url = serializers.SerializerMethodField()

    class Meta:
        model = TravelDocument
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_at']

    def get_fichier_url(self, obj):
        request = self.context.get('request')
        if obj.fichier and request:
            return request.build_absolute_uri(obj.fichier.url)
        return None

class BookingStatusHistorySerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.get_full_name', read_only=True)

    class Meta:
        model = BookingStatusHistory
        fields = '__all__'
        read_only_fields = ['id', 'date']

class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # Related object info
    booking_reference = serializers.CharField(source='travel_booking.id', read_only=True)
    booking_destination = serializers.CharField(source='travel_booking.destination', read_only=True)
    visa_application_number = serializers.CharField(source='visa_application.application_number', read_only=True)
    visa_type_name = serializers.CharField(source='visa_application.visa_type.name', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'reference', 'transaction_id', 'initiated_at', 'completed_at', 'updated_at']

class TravelBookingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user = serializers.SerializerMethodField()
    passengers = PassengerSerializer(many=True, read_only=True)
    documents = TravelDocumentSerializer(many=True, read_only=True)
    status_history = BookingStatusHistorySerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    billet_pdf_url = serializers.SerializerMethodField()
    visa_status = serializers.CharField(source='visa_application.status', read_only=True)

    class Meta:
        model = TravelBooking
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'billet_pdf', 'user']

    def get_billet_pdf_url(self, obj):
        request = self.context.get('request')
        if obj.billet_pdf and request:
            return request.build_absolute_uri(obj.billet_pdf.url)
        return None

    def get_user(self, obj):
        """Return user information in the format expected by frontend"""
        user = obj.user
        return {
            'id': user.id,
            'prenom': user.prenom,
            'nom': user.nom,
            'email': user.email,
            'telephone': user.telephone,
            'pays': user.pays,
        }
    
    def perform_create(self, serializer):
        client = getattr(self.request.user.profile, 'client', None)
        if not client:
            raise serializers.ValidationError("Profil client introuvable pour l'utilisateur connecté.")
        serializer.save(user=client)

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'payment_type', 'amount', 'currency', 'payment_method',
            'travel_booking', 'visa_application', 'description'
        ]
        read_only_fields = ['reference']

    # Validation will be handled in the ViewSet

    def create(self, validated_data):
        # Generate unique reference
        import uuid
        validated_data['reference'] = f"PAY-{uuid.uuid4().hex[:8].upper()}"

        # User will be set by the ViewSet's perform_create method
        return super().create(validated_data)

# Appointment Serializer
class AppointmentSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    agent_name = serializers.CharField(source='agent.get_full_name', read_only=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    location_display = serializers.CharField(source='get_location_display', read_only=True)

    # Related object info
    visa_application_number = serializers.CharField(source='visa_application.application_number', read_only=True)
    booking_id = serializers.CharField(source='travel_booking.id', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'agent']

# Appointment List Serializer for dashboard
class AppointmentListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    agent_name = serializers.CharField(source='agent.get_full_name', read_only=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    location_display = serializers.CharField(source='get_location_display', read_only=True)
    date_formatted = serializers.SerializerMethodField()
    is_upcoming = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'client', 'client_name', 'agent_name', 'reason', 'reason_display',
            'date', 'date_formatted', 'message', 'location', 'location_display',
            'required_documents', 'status', 'status_display', 'new_date',
            'visa_application', 'travel_booking', 'created_at', 'is_upcoming'
        ]
        read_only_fields = ['id', 'created_at', 'agent']

    def get_date_formatted(self, obj):
        return obj.date.strftime('%d/%m/%Y %H:%M')

    def get_is_upcoming(self, obj):
        from django.utils import timezone
        return obj.date > timezone.now()
