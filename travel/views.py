from decimal import Decimal
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, permissions, generics, status, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from io import BytesIO
from .models import (
    Country, VisaType, RequiredDocument, VisaApplication,
    ApplicationDocument, ApplicationHistory,
    DossierVoyage, DocumentVoyage,
    TravelBooking, Passenger, TravelDocument, BookingStatusHistory, Payment, Appointment,
    ExchangeRate, CurrencyExchangeRequest, ExchangeStatusHistory, Notification
)
from .serializers import (
    CountrySerializer, VisaTypeSerializer, RequiredDocumentSerializer,
    VisaApplicationSerializer, VisaApplicationDraftSerializer,
    VisaApplicationListSerializer, ApplicationDocumentSerializer,
    ApplicationHistorySerializer,
    DossierVoyageSerializer, DocumentVoyageSerializer,
    TravelBookingSerializer, PassengerSerializer, TravelDocumentSerializer, BookingStatusHistorySerializer,
    PaymentSerializer, PaymentCreateSerializer, AppointmentSerializer, AppointmentListSerializer,
    NotificationSerializer, ExchangeRateSerializer, CurrencyExchangeRequestSerializer,
    CurrencyExchangeRequestCreateSerializer, CurrencyExchangeRequestListSerializer, ExchangeStatusHistorySerializer
)

# Page d'accueil simple
def index(request):
    return HttpResponse("Bienvenue dans le module Travel 🚀")

# === VISA SYSTEM VIEWS ===

class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Country.objects.all().order_by('name')
    serializer_class = CountrySerializer
    permission_classes = [permissions.AllowAny]

class VisaTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VisaType.objects.filter(is_active=True).select_related('country')
    serializer_class = VisaTypeSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'])
    def required_documents(self, request, pk=None):
        visa_type = self.get_object()
        documents = visa_type.required_documents.all()
        serializer = RequiredDocumentSerializer(documents, many=True)
        return Response(serializer.data)

class RequiredDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RequiredDocument.objects.all()
    serializer_class = RequiredDocumentSerializer
    permission_classes = [permissions.AllowAny]

class VisaApplicationViewSet(viewsets.ModelViewSet):
    # Allow unauthenticated access for testing, but check authentication in methods
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = VisaApplication.objects.all()

        # Filter by applicant if provided in query params (for appointment creation)
        applicant_id = self.request.query_params.get('applicant')
        if applicant_id:
            queryset = queryset.filter(applicant_id=applicant_id)

        user = self.request.user
        print(f"DEBUG: request.user = {user}, type = {type(user)}, is_authenticated = {getattr(user, 'is_authenticated', 'N/A')}")

        # If user is a string (email), authentication failed
        if isinstance(user, str):
            print(f"DEBUG: User is a string, authentication failed: {user}")
            return queryset.none()

        if not user or not user.is_authenticated:
            print("DEBUG: User not authenticated - returning all applications for testing")
            # For testing purposes, return all applications when not authenticated
            return queryset

        try:
            profile = user.profile
            print(f"DEBUG: User profile role = {profile.role}")
            if profile.role == 'client':
                # Clients can only see their own applications
                if hasattr(profile, 'client') and profile.client:
                    return queryset.filter(applicant=profile.client)
                return queryset.none()
            elif profile.role in ['agent', 'admin']:
                # Agents and admins can see all applications
                return queryset
        except AttributeError as e:
            print(f"DEBUG: AttributeError accessing profile: {e}")
            # User doesn't have a profile - return all for testing
            return queryset
        return queryset.none()

    def get_serializer_class(self):
        if self.action == 'list':
            return VisaApplicationListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return VisaApplicationDraftSerializer
        return VisaApplicationSerializer

    def perform_create(self, serializer):
        # Associate with client based on current user
        user = self.request.user
        client = None

        if user and user.is_authenticated:
            try:
                client = user.profile.client  # Assuming profile has client relation
            except AttributeError:
                # If no profile or client, create a test client for development
                from core.models import Client
                client, created = Client.objects.get_or_create(
                    user=user,
                    defaults={
                        'first_name': user.first_name or 'Test',
                        'last_name': user.last_name or 'User',
                        'email': user.email,
                        'phone': '0000000000'
                    }
                )

        # Check for duplicate applications for the same visa type
        visa_type = serializer.validated_data.get('visa_type')
        if client and visa_type:
            # Check if user already has a pending application for this visa type
            existing_application = VisaApplication.objects.filter(
                applicant=client,
                visa_type=visa_type,
                status__in=['draft', 'submitted', 'under_review', 'additional_info_required', 'document_verification', 'biometrics_required', 'interview_required']
            ).exists()

            if existing_application:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({
                    'error': 'Vous avez déjà une demande en cours pour ce type de visa. '
                           'Veuillez attendre la finalisation de votre demande actuelle avant d\'en créer une nouvelle.'
                })

        if client:
            serializer.save(applicant=client)
        else:
            # For testing purposes, create a dummy client
            from core.models import Client
            dummy_client, created = Client.objects.get_or_create(
                email='test@example.com',
                defaults={
                    'first_name': 'Test',
                    'last_name': 'Client',
                    'phone': '0000000000'
                }
            )
            serializer.save(applicant=dummy_client)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        application = self.get_object()

        # Check if all mandatory documents are uploaded
        mandatory_docs = application.visa_type.required_documents.filter(is_mandatory=True)
        uploaded_docs = application.documents.filter(
            status='submitted',
            required_document__in=mandatory_docs
        )

        if mandatory_docs.count() != uploaded_docs.count():
            return Response(
                {'error': 'Tous les documents obligatoires doivent être téléversés avant soumission'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update status and create history
        old_status = application.status
        application.status = 'submitted'
        application.submitted_at = timezone.now()
        application.save()

        ApplicationHistory.objects.create(
            application=application,
            action='submitted',
            old_status=old_status,
            new_status='submitted',
            performed_by=request.user if request.user and request.user.is_authenticated else None,
            notes='Demande soumise par le client'
        )

        serializer = self.get_serializer(application)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')

        if new_status not in dict(VisaApplication.STATUS_CHOICES):
            return Response(
                {'error': 'Statut invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check permissions (only agents and admins can change status)
        if request.user.profile.role not in ['agent', 'admin']:
            return Response(
                {'error': 'Permission refusée'},
                status=status.HTTP_403_FORBIDDEN
            )

        old_status = application.status
        application.status = new_status

        # Set timestamps based on status
        if new_status == 'approved':
            application.approved_at = timezone.now()
        elif new_status == 'rejected':
            application.rejected_at = timezone.now()
            application.rejection_reason = notes

        application.save()

        # Create history entry
        ApplicationHistory.objects.create(
            application=application,
            action='status_changed',
            old_status=old_status,
            new_status=new_status,
            performed_by=request.user if request.user and request.user.is_authenticated else None,
            notes=notes
        )

        serializer = self.get_serializer(application)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign_agent(self, request, pk=None):
        application = self.get_object()
        agent_id = request.data.get('agent_id')

        if request.user.profile.role not in ['admin']:
            return Response(
                {'error': 'Seul un administrateur peut assigner un agent'},
                status=status.HTTP_403_FORBIDDEN
            )

        from django.contrib.auth.models import User
        try:
            agent = User.objects.get(id=agent_id, profile__role='agent')
            application.assigned_agent = agent
            application.save()

            ApplicationHistory.objects.create(
                application=application,
                action='assigned',
                performed_by=request.user if request.user and request.user.is_authenticated else None,
                notes=f'Assigné à l\'agent {agent.get_full_name()}'
            )

            serializer = self.get_serializer(application)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'error': 'Agent non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def generate_pdf(self, request, pk=None):
        application = self.get_object()

        # Generate PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title = Paragraph(f"Dossier de Demande de Visa - {application.application_number}", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))

        # Applicant Information
        story.append(Paragraph("Informations du demandeur", styles['Heading2']))
        applicant_data = [
            ['Nom complet', f"{application.first_name} {application.last_name}"],
            ['Date de naissance', application.date_of_birth.strftime('%d/%m/%Y')],
            ['Nationalité', application.nationality],
            ['Adresse', application.current_address],
            ['Email', application.email],
            ['Téléphone', application.phone_number or 'N/A'],
        ]
        applicant_table = Table(applicant_data, colWidths=[100, 300])
        applicant_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(applicant_table)
        story.append(Spacer(1, 12))

        # Visa Information
        story.append(Paragraph("Informations du visa", styles['Heading2']))
        visa_data = [
            ['Type de visa', application.visa_type.name],
            ['Destination', application.visa_type.country.name],
            ['Motif du voyage', application.purpose_of_visit],
            ['Date d\'arrivée', application.intended_date_of_arrival.strftime('%d/%m/%Y')],
            ['Date de départ', application.intended_date_of_departure.strftime('%d/%m/%Y')],
            ['Durée du séjour', f"{application.length_of_stay_days} jours"],
        ]
        visa_table = Table(visa_data, colWidths=[100, 300])
        visa_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(visa_table)
        story.append(Spacer(1, 12))

        # Documents
        story.append(Paragraph("Documents fournis", styles['Heading2']))
        doc_data = [['Document', 'Statut', 'Date de soumission']]
        for doc in application.documents.all():
            doc_data.append([
                doc.required_document.name,
                doc.get_status_display(),
                doc.uploaded_at.strftime('%d/%m/%Y') if doc.uploaded_at else 'N/A'
            ])

        if len(doc_data) > 1:
            doc_table = Table(doc_data, colWidths=[200, 100, 100])
            doc_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(doc_table)
        else:
            story.append(Paragraph("Aucun document soumis", styles['Normal']))

        # Status and Notes
        story.append(Spacer(1, 12))
        story.append(Paragraph("Statut de la demande", styles['Heading2']))
        status_data = [
            ['Statut actuel', application.get_status_display()],
            ['Date de soumission', application.submitted_at.strftime('%d/%m/%Y %H:%M') if application.submitted_at else 'N/A'],
            ['Agent assigné', application.assigned_agent.get_full_name() if application.assigned_agent else 'N/A'],
        ]
        status_table = Table(status_data, colWidths=[100, 300])
        status_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(status_table)

        if application.internal_notes:
            story.append(Spacer(1, 12))
            story.append(Paragraph("Notes internes", styles['Heading2']))
            story.append(Paragraph(application.internal_notes, styles['Normal']))

        # Build PDF
        doc.build(story)
        buffer.seek(0)

        # Return PDF response
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="visa_application_{application.application_number}.pdf"'
        return response

class ApplicationDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationDocumentSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            # For testing purposes, return all documents when not authenticated
            return ApplicationDocument.objects.all()

        try:
            profile = user.profile
            if profile.role == 'client':
                return ApplicationDocument.objects.filter(
                    application__applicant__user=user
                )
        except AttributeError:
            pass
        return ApplicationDocument.objects.all()

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        document = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')

        if request.user.profile.role not in ['agent', 'admin']:
            return Response(
                {'error': 'Permission refusée'},
                status=status.HTTP_403_FORBIDDEN
            )

        document.status = new_status
        document.reviewer_notes = notes
        document.reviewed_by = request.user
        document.reviewed_at = timezone.now()
        document.save()

        # Create history entry
        ApplicationHistory.objects.create(
            application=document.application,
            action='document_reviewed',
            performed_by=request.user if request.user and request.user.is_authenticated else None,
            notes=f'Document {document.required_document.name}: {new_status}'
        )

        serializer = self.get_serializer(document)
        return Response(serializer.data)

# === CURRENCY EXCHANGE VIEWS ===

class ExchangeRateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing exchange rates (admin only)
    """
    queryset = ExchangeRate.objects.all().order_by('-valid_from')
    serializer_class = ExchangeRateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role in ['agent', 'admin']:
            return ExchangeRate.objects.all()
        return ExchangeRate.objects.filter(is_active=True)

    @action(detail=False, methods=['get'])
    def current_rates(self, request):
        """Get current active exchange rates"""
        rates = ExchangeRate.objects.filter(is_active=True).order_by('from_currency', 'to_currency')
        serializer = self.get_serializer(rates, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def simulate_exchange(self, request):
        """
        Simulate a currency exchange with the given amount and currencies.
        Expected POST data:
        {
            "from_currency": "USD",
            "to_currency": "EUR",
            "amount": 100.00
        }
        """
        from_currency = request.data.get('from_currency')
        to_currency = request.data.get('to_currency')
        amount = request.data.get('amount')
        
        if not all([from_currency, to_currency, amount]):
            return Response(
                {"error": "Missing required fields: from_currency, to_currency, and amount are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError("Amount must be a positive number")
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid amount. Must be a positive number"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Try to find a direct exchange rate
        try:
            rate = ExchangeRate.objects.filter(
                from_currency=from_currency.upper(),
                to_currency=to_currency.upper(),
                is_active=True
            ).latest('valid_from')
            
            converted_amount = amount * rate.rate
            
            return Response({
                'from_currency': from_currency.upper(),
                'to_currency': to_currency.upper(),
                'amount': float(amount),
                'rate': float(rate.rate),
                'converted_amount': float(converted_amount),
                'last_updated': rate.updated_at
            })
            
        except ExchangeRate.DoesNotExist:
            # If no direct rate, check for a reverse rate
            try:
                reverse_rate = ExchangeRate.objects.filter(
                    from_currency=to_currency.upper(),
                    to_currency=from_currency.upper(),
                    is_active=True
                ).latest('valid_from')
                
                converted_amount = amount / reverse_rate.rate
                
                return Response({
                    'from_currency': from_currency.upper(),
                    'to_currency': to_currency.upper(),
                    'amount': float(amount),
                    'rate': 1.0 / float(reverse_rate.rate),
                    'converted_amount': float(converted_amount),
                    'last_updated': reverse_rate.updated_at
                })
                
            except ExchangeRate.DoesNotExist:
                return Response(
                    {"error": f"No exchange rate found for {from_currency.upper()} to {to_currency.upper()} (direct or reverse)"},
                    status=status.HTTP_404_NOT_FOUND
                )


        try:
            rate_obj = ExchangeRate.objects.filter(
                from_currency=from_currency,
                to_currency=to_currency,
                is_active=True
            ).latest('valid_from')

            amount = Decimal(str(amount))
            gross_received = amount * rate_obj.rate
            fee = (gross_received * rate_obj.fee_percentage / 100) + rate_obj.fee_fixed
            net_received = gross_received - fee

            return Response({
                'from_currency': from_currency,
                'to_currency': to_currency,
                'amount_sent': amount,
                'exchange_rate': rate_obj.rate,
                'fee_percentage': rate_obj.fee_percentage,
                'fee_fixed': rate_obj.fee_fixed,
                'fee_amount': fee,
                'gross_received': gross_received,
                'net_received': net_received
            })
        except ExchangeRate.DoesNotExist:
            return Response({'error': 'Exchange rate not found'}, status=status.HTTP_404_NOT_FOUND)


class CurrencyExchangeRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for currency exchange requests
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'client':
            return CurrencyExchangeRequest.objects.filter(user=user.profile.client)
        elif hasattr(user, 'profile') and user.profile.role in ['agent', 'admin']:
            return CurrencyExchangeRequest.objects.all()
        return CurrencyExchangeRequest.objects.none()

    def get_serializer_class(self):
        if self.action == 'list':
            return CurrencyExchangeRequestListSerializer
        elif self.action == 'create':
            return CurrencyExchangeRequestCreateSerializer
        return CurrencyExchangeRequestSerializer

    def perform_create(self, serializer):
        exchange_request = serializer.save()

        # Create initial status history
        ExchangeStatusHistory.objects.create(
            exchange_request=exchange_request,
            action='created',
            new_status='pending',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            notes='Demande créée'
        )


    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Change exchange request status (agent only)"""
        exchange_request = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')

        if request.user.profile.role not in ['agent', 'admin']:
            return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)

        if new_status not in dict(CurrencyExchangeRequest.STATUS_CHOICES):
            return Response({'error': 'Statut invalide'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = exchange_request.status
        exchange_request.status = new_status

        if new_status == 'completed':
            exchange_request.completed_at = timezone.now()
        elif new_status in ['cancelled', 'rejected']:
            exchange_request.completed_at = timezone.now()

        exchange_request.save()

        # Create status history
        ExchangeStatusHistory.objects.create(
            exchange_request=exchange_request,
            action='status_changed',
            old_status=old_status,
            new_status=new_status,
            performed_by=request.user,
            notes=notes
        )

        # Create notification for the client
        notification_title = f"Échange {exchange_request.reference} - Statut mis à jour"
        notification_message = f"Votre demande d'échange de devise {exchange_request.reference} est maintenant {exchange_request.get_status_display()}."

        if new_status == 'completed':
            notification_title = f"Échange {exchange_request.reference} - Terminé"
            notification_message = f"Votre échange de devise {exchange_request.reference} a été effectué avec succès. Vous pouvez télécharger votre reçu."
        elif new_status == 'rejected':
            notification_title = f"Échange {exchange_request.reference} - Refusé"
            notification_message = f"Votre demande d'échange de devise {exchange_request.reference} a été refusée."

        Notification.objects.create(
            user=exchange_request.user,
            title=notification_title,
            message=notification_message,
            notification_type='exchange_status',
            related_exchange=exchange_request
        )

        serializer = self.get_serializer(exchange_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign_agent(self, request, pk=None):
        """Assign agent to exchange request (admin only)"""
        exchange_request = self.get_object()
        agent_id = request.data.get('agent_id')

        if request.user.profile.role not in ['admin']:
            return Response({'error': 'Seul un administrateur peut assigner un agent'}, status=status.HTTP_403_FORBIDDEN)

        from django.contrib.auth.models import User
        try:
            agent = User.objects.get(id=agent_id, profile__role='agent')
            exchange_request.assigned_agent = agent
            exchange_request.save()

            ExchangeStatusHistory.objects.create(
                exchange_request=exchange_request,
                action='assigned',
                performed_by=request.user,
                notes=f'Assigné à l\'agent {agent.get_full_name()}'
            )

            serializer = self.get_serializer(exchange_request)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'Agent non trouvé'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def generate_pdf(self, request, pk=None):
        """Generate PDF receipt for completed exchange"""
        exchange_request = self.get_object()

        if exchange_request.status != 'completed':
            return Response({'error': 'Le reçu ne peut être généré que pour les échanges effectués'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title = Paragraph(f"Reçu d'échange de devise - {exchange_request.reference}", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))

        # Exchange details
        story.append(Paragraph("Détails de l'échange", styles['Heading2']))
        details_data = [
            ['Référence', exchange_request.reference],
            ['Client', exchange_request.user.get_full_name()],
            ['Date', exchange_request.completed_at.strftime('%d/%m/%Y %H:%M')],
            ['Devise envoyée', f"{exchange_request.amount_sent} {exchange_request.from_currency}"],
            ['Devise reçue', f"{exchange_request.amount_received} {exchange_request.to_currency}"],
            ['Taux appliqué', f"{exchange_request.exchange_rate}"],
            ['Frais', f"{exchange_request.fee_amount} {exchange_request.to_currency}"],
            ['Mode de réception', exchange_request.get_reception_method_display()],
        ]

        # Add reception details
        if exchange_request.reception_method == 'agency_pickup':
            details_data.append(['Agence de retrait', exchange_request.pickup_agency])
        elif exchange_request.reception_method == 'bank_transfer':
            details_data.extend([
                ['Banque', exchange_request.bank_name],
                ['Titulaire', exchange_request.account_holder_name],
                ['IBAN', exchange_request.iban],
            ])
        elif exchange_request.reception_method == 'mobile_money':
            details_data.extend([
                ['Opérateur', exchange_request.mobile_operator],
                ['Numéro', exchange_request.mobile_number],
            ])

        details_table = Table(details_data, colWidths=[120, 250])
        details_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(details_table)
        story.append(Spacer(1, 12))

        # Important notice
        story.append(Paragraph("AVIS IMPORTANT", styles['Heading2']))
        notice_text = """
        Cet échange de devise est simulé et ne constitue pas une transaction financière réelle.
        Aucun paiement n'a été effectué sur la plateforme. Ce document est fourni à titre informatif uniquement.
        """
        story.append(Paragraph(notice_text, styles['Normal']))
        story.append(Spacer(1, 12))

        # Agent signature
        if exchange_request.assigned_agent:
            story.append(Paragraph(f"Traitée par: {exchange_request.assigned_agent.get_full_name()}", styles['Normal']))

        # Footer
        story.append(Spacer(1, 20))
        story.append(Paragraph("GSC - Agence d'immigration", styles['Normal']))
        story.append(Paragraph(f"Généré le {timezone.now().strftime('%d/%m/%Y à %H:%M')}", styles['Normal']))

        doc.build(story)
        buffer.seek(0)

        # Save PDF to model
        filename = f"exchange_receipt_{exchange_request.reference}.pdf"
        exchange_request.receipt_pdf.save(filename, BytesIO(buffer.getvalue()))

        # Return PDF response
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download the document file
        """
        document = self.get_object()

        if not document.file:
            return Response(
                {'error': 'Aucun fichier associé à ce document'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Open the file and return it as a response
            file_handle = document.file.open()
            response = HttpResponse(file_handle, content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{document.file_name or document.required_document.name}"'
            return response
        except Exception as e:
            return Response(
                {'error': f'Erreur lors du téléchargement: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ApplicationHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ApplicationHistorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        application_id = self.request.query_params.get('application')
        if application_id:
            return ApplicationHistory.objects.filter(application_id=application_id)
        return ApplicationHistory.objects.none()

# === LEGACY VIEWS (keeping for backward compatibility) ===

class DossierVoyageViewSet(viewsets.ModelViewSet):
    queryset = DossierVoyage.objects.all().order_by("-created_at")
    serializer_class = DossierVoyageSerializer
    permission_classes = [permissions.IsAuthenticated]

class DocumentVoyageViewSet(viewsets.ModelViewSet):
    queryset = DocumentVoyage.objects.all().order_by("-created_at")
    serializer_class = DocumentVoyageSerializer
    permission_classes = [permissions.IsAuthenticated]

class DossierVoyageListCreate(generics.ListCreateAPIView):
    queryset = DossierVoyage.objects.all().order_by("-created_at")
    serializer_class = DossierVoyageSerializer
    permission_classes = [permissions.IsAuthenticated]

def dossier_voyage_list_json(request):
    data = list(DossierVoyage.objects.values())
    return JsonResponse(data, safe=False)

# === MODULE RESERVATION DE BILLETS DE VOYAGE ===

class TravelBookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet principal pour la gestion des réservations de billets de voyage.
    Permet la création, modification, suppression, soumission, export PDF, et suivi des statuts.
    """
    serializer_class = TravelBookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = TravelBooking.objects.all().order_by('-created_at')

        # Filter by user if provided in query params (for appointment creation)
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'client':
            # Clients can only see their own bookings
            if hasattr(user.profile, 'client') and user.profile.client:
                return queryset.filter(user=user.profile.client)
            return queryset.none()
        elif hasattr(user, 'profile') and user.profile.role in ['agent', 'admin']:
            # Agents and admins can see all bookings
            return queryset
        return queryset.none()

    def get_permissions(self):
        """
        Allow OPTIONS requests without authentication for CORS preflight.
        """
        if self.request.method == 'OPTIONS':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def perform_create(self, serializer):
        # Associe la réservation à l'utilisateur connecté
        serializer.save(user=self.request.user.profile.client)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        Soumet la réservation (étape finale du stepper).
        Crée les passagers et documents depuis les données draft, puis passe le statut à 'pending_payment'.
        """
        booking = self.get_object()
        if booking.statut != 'draft':
            return Response({'error': 'Réservation déjà soumise ou traitée.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create passengers from draft data
        if booking.draft_passengers:
            for passenger_data in booking.draft_passengers:
                Passenger.objects.create(
                    booking=booking,
                    nom=passenger_data.get('nom', ''),
                    prenom=passenger_data.get('prenom', ''),
                    date_naissance=passenger_data.get('date_naissance', ''),
                    sexe=passenger_data.get('sexe', 'other'),
                    nationalite=passenger_data.get('nationalite', ''),
                    numero_passeport=passenger_data.get('numero_passeport', ''),
                    expiration_passeport=passenger_data.get('expiration_passeport', '')
                )

        # Documents are already created via API, no need to create from draft

        # Clear draft data
        booking.draft_passengers = None

        # Update status
        booking.statut = 'pending_payment'
        booking.save()

        BookingStatusHistory.objects.create(
            booking=booking,
            statut='pending_payment',
            agent=None,
            notes='Demande soumise par le client - en attente de paiement.'
        )
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['get'])
    def generate_pdf(self, request, pk=None):
        """
        Génère le PDF récapitulatif de la réservation (client ou agent).
        Inclut les informations détaillées, montant et dates de voyage.
        """
        booking = self.get_object()
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title = Paragraph(f"Dossier de Réservation - {booking.destination}", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))

        # Reservation Info
        story.append(Paragraph("Informations de la réservation", styles['Heading2']))
        reservation_data = [
            ['Numéro de réservation', f"#{booking.id}"],
            ['Statut', booking.get_statut_display()],
            ['Date de création', booking.created_at.strftime('%d/%m/%Y %H:%M')],
            ['Destination', booking.destination],
            ['Ville de départ', booking.ville_depart],
            ['Ville d\'arrivée', booking.ville_arrivee],
            ['Classe', booking.get_travel_class_display()],
            ['Type de voyage', 'Aller-retour' if booking.aller_retour else 'Aller simple'],
            ['Nombre de passagers', str(booking.nombre_passagers)],
        ]
        reservation_table = Table(reservation_data, colWidths=[120, 250])
        reservation_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(reservation_table)
        story.append(Spacer(1, 12))

        # Travel Dates
        story.append(Paragraph("Dates de voyage", styles['Heading2']))
        dates_data = [
            ['Date de départ', booking.date_depart.strftime('%d/%m/%Y')],
        ]
        if booking.aller_retour and booking.date_retour:
            dates_data.append(['Date de retour', booking.date_retour.strftime('%d/%m/%Y')])
        else:
            dates_data.append(['Type', 'Aller simple'])

        dates_table = Table(dates_data, colWidths=[120, 250])
        dates_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(dates_table)
        story.append(Spacer(1, 12))

        # Client Information
        story.append(Paragraph("Informations du client", styles['Heading2']))
        client_data = [
            ['Nom complet', f"{booking.user.prenom} {booking.user.nom}"],
            ['Email', booking.user.email],
            ['Téléphone', booking.user.telephone or 'N/A'],
            ['Pays', booking.user.pays or 'N/A'],
        ]
        client_table = Table(client_data, colWidths=[120, 250])
        client_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(client_table)
        story.append(Spacer(1, 12))

        # Payment Information
        payments = Payment.objects.filter(travel_booking=booking)
        if payments.exists():
            story.append(Paragraph("Informations de paiement", styles['Heading2']))
            payment = payments.first()  # Get the latest payment
            payment_data = [
                ['Référence de paiement', payment.reference],
                ['Montant', f"{payment.amount} {payment.currency}"],
                ['Méthode de paiement', payment.get_payment_method_display()],
                ['Statut du paiement', payment.get_status_display()],
                ['Date de paiement', payment.initiated_at.strftime('%d/%m/%Y %H:%M')],
            ]
            if payment.completed_at:
                payment_data.append(['Date de validation', payment.completed_at.strftime('%d/%m/%Y %H:%M')])

            payment_table = Table(payment_data, colWidths=[120, 250])
            payment_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(payment_table)
            story.append(Spacer(1, 12))

        # Passengers
        if booking.passengers.exists():
            story.append(Paragraph("Passagers", styles['Heading2']))
            passenger_data = [['Nom', 'Prénom', 'Date de naissance', 'Passeport']]
            for p in booking.passengers.all():
                passenger_data.append([
                    p.nom,
                    p.prenom,
                    p.date_naissance.strftime('%d/%m/%Y') if p.date_naissance else 'N/A',
                    p.numero_passeport
                ])

            passenger_table = Table(passenger_data, colWidths=[80, 80, 100, 120])
            passenger_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(passenger_table)
            story.append(Spacer(1, 12))

        # Documents
        if booking.documents.exists():
            story.append(Paragraph("Documents", styles['Heading2']))
            doc_data = [['Type', 'Statut', 'Date d\'upload']]
            for docu in booking.documents.all():
                doc_data.append([
                    docu.get_type_display(),
                    docu.get_statut_display(),
                    docu.uploaded_at.strftime('%d/%m/%Y') if docu.uploaded_at else 'N/A'
                ])

            doc_table = Table(doc_data, colWidths=[100, 80, 100])
            doc_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(doc_table)

        # Footer
        story.append(Spacer(1, 20))
        story.append(Paragraph("Ce document est généré automatiquement par le système de réservation.", styles['Normal']))
        story.append(Paragraph(f"Généré le {timezone.now().strftime('%d/%m/%Y à %H:%M')}", styles['Normal']))

        doc.build(story)
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="reservation_{booking.id}_{booking.destination.replace(' ', '_')}.pdf"'
        return response

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """
        Permet à l'agent de changer le statut de la réservation et d'ajouter un billet.
        """
        booking = self.get_object()
        new_status = request.data.get('statut')
        notes = request.data.get('notes', '')
        billet_pdf = request.FILES.get('billet_pdf')
        if new_status not in dict(TravelBooking.STATUS_CHOICES):
            return Response({'error': 'Statut invalide.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.statut = new_status
        if billet_pdf:
            booking.billet_pdf = billet_pdf
        booking.save()
        BookingStatusHistory.objects.create(
            booking=booking,
            statut=new_status,
            agent=request.user if request.user and request.user.is_authenticated else None,
            notes=notes
        )
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """
        Retourne les documents associés à cette réservation.
        """
        booking = self.get_object()
        documents = TravelDocument.objects.filter(booking=booking)
        serializer = TravelDocumentSerializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Permet au client d'annuler une réservation en attente de paiement.
        """
        booking = self.get_object()
        if booking.statut != 'pending_payment':
            return Response({'error': 'Seules les réservations en attente de paiement peuvent être annulées.'}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response({'error': 'Un motif d\'annulation est requis.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.statut = 'cancelled'
        booking.save()

        # Create cancellation history
        BookingStatusHistory.objects.create(
            booking=booking,
            statut='cancelled',
            agent=None,
            notes=f'Annulé par le client: {reason}'
        )

        return Response({'success': 'Réservation annulée avec succès.'})

    @action(detail=True, methods=['delete'])
    def delete_booking(self, request, pk=None):
        """
        Permet au client de supprimer une réservation tant qu'elle n'est pas traitée.
        """
        booking = self.get_object()
        if booking.statut != 'draft':
            return Response({'error': 'Impossible de supprimer une réservation déjà soumise ou traitée.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.delete()
        return Response({'success': 'Réservation supprimée.'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def validate_booking(self, request, pk=None):
        """
        Action pour que l'agent valide définitivement une réservation
        """
        booking = self.get_object()

        # Vérifier que l'utilisateur est un agent ou admin
        if request.user.profile.role not in ['agent', 'admin']:
            return Response(
                {'error': 'Seuls les agents et administrateurs peuvent valider les réservations'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifier que la réservation est en attente de validation agent
        if booking.statut != 'pending_agent_validation':
            return Response(
                {'error': 'Cette réservation n\'est pas en attente de validation'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Marquer la fin de procédure
        booking.statut = 'confirmed'
        booking.procedure_end_date = timezone.now()
        booking.save()

        # Créer une entrée d'historique
        BookingStatusHistory.objects.create(
            booking=booking,
            statut='confirmed',
            agent=request.user,
            notes='Réservation validée définitivement par l\'agent'
        )

        return Response({
            'message': 'Réservation validée avec succès',
            'booking': self.get_serializer(booking).data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def assign_agent(self, request, pk=None):
        """
        Action pour assigner un agent à une réservation
        """
        booking = self.get_object()

        # Vérifier que l'utilisateur est un agent ou admin
        if request.user.profile.role not in ['agent', 'admin']:
            return Response(
                {'error': 'Seuls les agents et administrateurs peuvent assigner des réservations'},
                status=status.HTTP_403_FORBIDDEN
            )

        booking.assigned_agent = request.user
        booking.save()

        return Response({
            'message': 'Agent assigné avec succès',
            'booking': self.get_serializer(booking).data
        })

class PassengerViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion dynamique des passagers d'une réservation.
    """
    queryset = Passenger.objects.all()
    serializer_class = PassengerSerializer
    permission_classes = [permissions.IsAuthenticated]

class TravelDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour l'upload et la gestion des documents liés à une réservation.
    """
    queryset = TravelDocument.objects.all()
    serializer_class = TravelDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

class BookingStatusHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour le suivi de l'historique des statuts d'une réservation.
    """
    queryset = BookingStatusHistory.objects.all()
    serializer_class = BookingStatusHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des paiements.
    """
    queryset = Payment.objects.all().order_by('-initiated_at')
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'client':
            return Payment.objects.filter(user=user.profile.client)
        elif hasattr(user, 'profile') and user.profile.role in ['agent', 'admin']:
            return Payment.objects.all()
        return Payment.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve_payment(self, request, pk=None):
        """
        Action pour que l'agent valide un paiement et mette à jour la réservation
        """
        payment = self.get_object()

        # Vérifier que l'utilisateur est un agent ou admin
        if request.user.profile.role not in ['agent', 'admin']:
            return Response(
                {'error': 'Seuls les agents et administrateurs peuvent valider les paiements'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifier que le paiement est en attente
        if payment.status not in ['processing', 'pending']:
            return Response(
                {'error': 'Ce paiement ne peut pas être validé'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Marquer le paiement comme validé
        payment.status = 'completed'
        payment.completed_at = timezone.now()
        payment.save()

        # Mettre à jour la réservation
        if payment.travel_booking:
            booking = payment.travel_booking
            booking.statut = 'pending_agent_validation'
            booking.procedure_start_date = timezone.now()
            booking.assigned_agent = request.user
            # Durée de procédure par défaut (peut être configurée)
            booking.procedure_duration_days = 7  # 7 jours par défaut
            booking.save()

            # Créer une entrée d'historique
            BookingStatusHistory.objects.create(
                booking=booking,
                statut='pending_agent_validation',
                agent=request.user,
                notes='Paiement validé par l\'agent - en attente de validation finale'
            )

        return Response({
            'message': 'Paiement validé avec succès',
            'payment': PaymentSerializer(payment).data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject_payment(self, request, pk=None):
        """
        Action pour que l'agent rejette un paiement
        """
        payment = self.get_object()

        # Vérifier que l'utilisateur est un agent ou admin
        if request.user.profile.role not in ['agent', 'admin']:
            return Response(
                {'error': 'Seuls les agents et administrateurs peuvent rejeter les paiements'},
                status=status.HTTP_403_FORBIDDEN
            )

        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response(
                {'error': 'Un motif de rejet est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Marquer le paiement comme rejeté
        payment.status = 'failed'
        payment.save()

        # Remettre la réservation en attente de paiement
        if payment.travel_booking:
            booking = payment.travel_booking
            booking.statut = 'pending_payment'
            booking.save()

            BookingStatusHistory.objects.create(
                booking=booking,
                statut='pending_payment',
                agent=request.user,
                notes=f'Paiement rejeté: {reason}'
            )

        return Response({
            'message': 'Paiement rejeté',
            'payment': PaymentSerializer(payment).data
        })

    def perform_create(self, serializer):
        # Ensure user is set from the request
        user = self.request.user
        if not user or not user.is_authenticated:
            raise serializers.ValidationError("Utilisateur non authentifié")

        try:
            client = user.profile.client
        except AttributeError:
            # If no profile or client, create one
            from core.models import Client
            client, created = Client.objects.get_or_create(
                user=user,
                defaults={
                    'first_name': user.first_name or 'Test',
                    'last_name': user.last_name or 'User',
                    'email': user.email,
                    'telephone': '0000000000',
                    'pays': 'Unknown'
                }
            )

        # Validate ownership of related objects
        data = serializer.validated_data
        if data.get('travel_booking') and data['travel_booking'].user != client:
            raise serializers.ValidationError("Vous n'avez pas l'autorisation de créer un paiement pour cette réservation")

        if data.get('visa_application') and data['visa_application'].applicant != client:
            raise serializers.ValidationError("Vous n'avez pas l'autorisation de créer un paiement pour cette demande de visa")

        serializer.save(user=client)

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        """
        Traite le paiement (simulation).
        """
        payment = self.get_object()

        if payment.status != 'pending':
            return Response({'error': 'Paiement déjà traité'}, status=status.HTTP_400_BAD_REQUEST)

        # Simulation de traitement de paiement
        # En production, intégrer avec une passerelle de paiement réelle
        payment.status = 'processing'  # En attente de validation agent
        payment.transaction_id = f"TXN-{payment.reference}"
        payment.payment_gateway = 'simulation'
        payment.save()

        # Si c'est un paiement pour une réservation de vol, mettre à jour le statut
        if payment.travel_booking:
            booking = payment.travel_booking
            booking.statut = 'processing'  # En attente validation agent
            booking.save()

            BookingStatusHistory.objects.create(
                booking=booking,
                statut='processing',
                agent=None,
                notes=f'Paiement soumis - en attente validation agent - {payment.reference}'
            )

        # Si c'est un paiement pour une demande de visa, mettre à jour le statut
        if payment.visa_application:
            visa_app = payment.visa_application
            visa_app.status = 'payment_pending'  # Garde le statut en attente
            visa_app.save()

        serializer = self.get_serializer(payment)
        return Response(serializer.data)

# === NOTIFICATION SYSTEM ===

class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user notifications
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'client':
            return Notification.objects.filter(user=user.profile.client)
        elif hasattr(user, 'profile') and user.profile.role in ['agent', 'admin']:
            return Notification.objects.all()
        return Notification.objects.none()

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'message': 'Notification marquée comme lue'})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all user notifications as read"""
        user = request.user
        if hasattr(user, 'profile') and user.profile.role == 'client':
            Notification.objects.filter(user=user.profile.client, is_read=False).update(
                is_read=True,
                read_at=timezone.now()
            )
        return Response({'message': 'Toutes les notifications ont été marquées comme lues'})

# Appointment ViewSet
class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing appointments.
    Agents can create, list, and update appointments.
    Clients can view and mark their appointments as read.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'client':
            # Clients can only see their own appointments
            if hasattr(user.profile, 'client') and user.profile.client:
                return Appointment.objects.filter(client=user.profile.client)
        elif hasattr(user, 'profile') and user.profile.role in ['agent', 'admin']:
            # Agents and admins can see all appointments
            return Appointment.objects.all()
        return Appointment.objects.none()

    def get_serializer_class(self):
        if self.action == 'list':
            return AppointmentListSerializer
        return AppointmentSerializer

    def perform_create(self, serializer):
        # Set the agent to the current user
        appointment = serializer.save(agent=self.request.user)

        # Send email notification to client
        self.send_appointment_notification_email(appointment)

    def send_appointment_notification_email(self, appointment):
        """Send email notification to client about the appointment"""
        try:
            from django.core.mail import send_mail
            from django.conf import settings

            subject = f'Nouveau rendez-vous programmé - {appointment.get_reason_display()}'
            message = f"""
Cher(e) {appointment.client.prenom} {appointment.client.nom},

Un nouveau rendez-vous a été programmé pour vous :

Motif : {appointment.get_reason_display()}
Date et heure : {appointment.date.strftime('%d/%m/%Y à %H:%M')}
Lieu : {appointment.get_location_display()}

{appointment.message}

Documents à apporter :
{', '.join([doc.replace('_', ' ').title() for doc in appointment.required_documents]) if appointment.required_documents else 'Aucun document spécifique requis'}

Cordialement,
L'équipe GSC
            """

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[appointment.client.email],
                fail_silently=True
            )
        except Exception as e:
            # Log the error but don't fail the appointment creation
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send appointment notification email: {e}")

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark appointment as read (for clients)
        """
        appointment = self.get_object()

        # Check if user is the client
        if request.user.profile.role == 'client' and appointment.client == request.user.profile.client:
            appointment.status = 'read'
            appointment.save()
            return Response({'message': 'Rendez-vous marqué comme lu'})
        else:
            return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """
        Change appointment status (for agents)
        """
        appointment = self.get_object()
        new_status = request.data.get('status')
        new_date = request.data.get('new_date')

        if request.user.profile.role not in ['agent', 'admin']:
            return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)

        if new_status not in dict(Appointment.STATUS_CHOICES):
            return Response({'error': 'Statut invalide'}, status=status.HTTP_400_BAD_REQUEST)

        appointment.status = new_status
        if new_status == 'postponed' and new_date:
            appointment.new_date = new_date
        appointment.save()

        return Response(self.get_serializer(appointment).data)

    @action(detail=True, methods=['post'])
    def cancel_payment(self, request, pk=None):
        """
        Annule un paiement en attente.
        """
        payment = self.get_object()

        if payment.status != 'pending':
            return Response({'error': 'Impossible d\'annuler ce paiement'}, status=status.HTTP_400_BAD_REQUEST)

        payment.status = 'cancelled'
        payment.save()

        serializer = self.get_serializer(payment)
        return Response(serializer.data)
