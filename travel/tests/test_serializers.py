from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from travel.models import Country, VisaType, VisaApplication
from travel.serializers import VisaApplicationSerializer
from core.models import Client

User = get_user_model()

class VisaApplicationSerializerTest(TestCase):
    def setUp(self):
        # Créer un pays
        self.country = Country.objects.create(
            name="France",
            code="FR"
        )
        
        # Créer un type de visa
        self.visa_type = VisaType.objects.create(
            name="Visa Touristique",
            country=self.country,
            category='tourist',
            entry_type='single',
            validity_days=90,
            min_duration_days=7,
            max_duration_days=90,
            min_processing_days=5,
            max_processing_days=15,
            service_fee=100.00,
            currency='EUR',
            is_active=True
        )
        
        # Créer un utilisateur et un client associé
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Créer un client
        self.client_user = Client.objects.create(
            nom='Dupont',
            prenom='Jean',
            email='jean.dupont@example.com',
            telephone='+33123456789',
            type_piece='passeport',
            numero_piece='AB123456',
            pays='France'
        )
        
        # Données pour la demande de visa
        self.visa_application_data = {
            'visa_type': self.visa_type.id,
            'first_name': 'Jean',
            'last_name': 'Dupont',
            'date_of_birth': '1990-01-01',
            'nationality': 'Française',
            'passport_number': 'AB123456',
            'passport_issue_date': '2020-01-01',
            'passport_expiry_date': '2030-01-01',
            'country': self.country.id,
            'current_address': '123 Rue de Paris',
            'city': 'Paris',
            'postal_code': '75001',
            'phone_number': '+33123456789',
            'email': 'jean.dupont@example.com',
            'purpose_of_visit': 'Tourisme',
            'intended_date_of_arrival': '2024-01-15',
            'intended_date_of_departure': '2024-01-30',
            'length_of_stay_days': 15,
            'accommodation_type': 'hotel',
            'accommodation_name': 'Hôtel de Paris',
            'occupation_type': 'employed',
            'occupation': 'Ingénieur',
            'marital_status': 'single',
            'emergency_contact_name': 'Marie Dupont',
            'emergency_relationship': 'Sœur',
            'emergency_phone': '+33612345678',
            'emergency_address': '456 Rue de Lyon, 75002 Paris',
        }
    
    def test_visa_application_serializer_create(self):
        """Teste la création d'une demande de visa avec le sérialiseur"""
        serializer = VisaApplicationSerializer(data=self.visa_application_data, context={'request': None})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        # Vérifier que l'application est créée avec le bon statut
        visa_application = serializer.save(applicant=self.client_user)
        self.assertEqual(visa_application.status, 'draft')
        self.assertIsNotNone(visa_application.created_at)
        
        # Vérifier que les champs sont correctement enregistrés
        self.assertEqual(visa_application.first_name, 'Jean')
        self.assertEqual(visa_application.last_name, 'Dupont')
        self.assertEqual(visa_application.nationality, 'Française')
        self.assertEqual(visa_application.passport_number, 'AB123456')
        self.assertEqual(visa_application.occupation, 'Ingénieur')
        self.assertEqual(visa_application.visa_type, self.visa_type)
    
    def test_visa_application_serializer_update(self):
        """Teste la mise à jour d'une demande de visa avec le sérialiseur"""
        # Créer une demande de visa initiale
        visa_application = VisaApplication.objects.create(
            applicant=self.client_user,
            visa_type=self.visa_type,
            first_name='Jean',
            last_name='Dupont',
            nationality='Française',
            status='draft'
        )
        
        # Données de mise à jour
        update_data = {
            'first_name': 'Jean-Michel',
            'occupation': 'Ingénieur logiciel',
            'email': 'jean-michel.dupont@example.com',
            'phone_number': '+33123456789'
        }
        
        # Mettre à jour la demande
        serializer = VisaApplicationSerializer(
            instance=visa_application,
            data=update_data,
            partial=True,
            context={'request': None}
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_application = serializer.save()
        
        # Vérifier les mises à jour
        self.assertEqual(updated_application.first_name, 'Jean-Michel')
        self.assertEqual(updated_application.occupation, 'Ingénieur logiciel')
        self.assertEqual(updated_application.email, 'jean-michel.dupont@example.com')
        self.assertEqual(updated_application.phone_number, '+33123456789')
    
    def test_visa_application_serializer_validation(self):
        """Teste la validation des données du sérialiseur"""
        # Données invalides (champs obligatoires manquants)
        invalid_data = {
            'visa_type': self.visa_type.id,
            'first_name': '',  # Champ obligatoire vide
            'last_name': '',   # Champ obligatoire vide
        }
        
        serializer = VisaApplicationSerializer(data=invalid_data, context={'request': None})
        self.assertFalse(serializer.is_valid())
        self.assertIn('first_name', serializer.errors)
        self.assertIn('last_name', serializer.errors)
    
    def test_visa_application_serializer_read_only_fields(self):
        """Teste que les champs en lecture seule ne peuvent pas être modifiés"""
        # Créer une demande de visa avec statut 'submitted' pour générer un numéro de demande
        visa_application = VisaApplication.objects.create(
            applicant=self.client_user,
            visa_type=self.visa_type,
            first_name='Jean',
            last_name='Dupont',
            nationality='Française',
            status='submitted'  # Statut différent de 'draft' pour générer un numéro de demande
        )
        
        # Sauvegarder les valeurs originales des champs en lecture seule
        original_application_number = visa_application.application_number
        self.assertIsNotNone(original_application_number, "Le numéro de demande devrait être généré pour une demande soumise")
        
        # Essayer de modifier un champ en lecture seule et un champ modifiable
        update_data = {
            'application_number': 'NEW-123456',  # Champ en lecture seule
            'status': 'approved',  # Champ en lecture seule
            'first_name': 'Jean-Michel'  # Champ modifiable pour vérifier que la mise à jour fonctionne
        }
        
        serializer = VisaApplicationSerializer(
            instance=visa_application,
            data=update_data,
            partial=True,
            context={'request': None}
        )
        
        # La validation devrait réussir car les champs en lecture seule sont ignorés
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_application = serializer.save()
        
        # Vérifier que les champs en lecture seule n'ont pas été modifiés
        self.assertEqual(updated_application.application_number, original_application_number, 
                        "Le numéro de demande ne devrait pas pouvoir être modifié")
        self.assertEqual(updated_application.status, 'submitted', 
                        "Le statut ne devrait pas pouvoir être modifié directement via le sérialiseur")
        # Vérifier que le champ modifiable a bien été mis à jour
        self.assertEqual(updated_application.first_name, 'Jean-Michel', 
                        "Le prénom devrait avoir été mis à jour")
