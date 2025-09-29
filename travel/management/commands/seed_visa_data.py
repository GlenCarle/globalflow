from django.core.management.base import BaseCommand
from travel.models import Country, VisaType, RequiredDocument

class Command(BaseCommand):
    help = 'Seed the database with sample visa types and required documents'

    def handle(self, *args, **options):
        # Create or get countries
        france, _ = Country.objects.get_or_create(
            name='France',
            code='FR',
            is_active=True
        )
        
        canada, _ = Country.objects.get_or_create(
            name='Canada',
            code='CA',
            is_active=True
        )

        # Sample visa types
        visa_types = [
            {
                'name': 'Visa Touristique',
                'country': france,
                'category': 'tourism',
                'description': 'Visa pour tourisme en France',
                'duration_days': 90,
                'is_active': True
            },
            {
                'name': 'Visa Étudiant',
                'country': france,
                'category': 'study',
                'description': 'Visa pour études en France',
                'duration_days': 365,
                'is_active': True
            },
            {
                'name': 'Visa Touristique',
                'country': canada,
                'category': 'tourism',
                'description': 'Visa pour tourisme au Canada',
                'duration_days': 180,
                'is_active': True
            },
        ]

        # Required documents for visa types
        required_docs = [
            {
                'name': 'Passeport',
                'description': 'Passeport valide au moins 6 mois après la date de retour',
                'document_type': 'passport',
                'is_mandatory': True,
                'max_file_size_mb': 10,
                'allowed_formats': 'pdf,jpg,jpeg,png'
            },
            {
                'name': 'Photo d\'identité',
                'description': 'Photo d\'identité récente (format 35x45mm)',
                'document_type': 'photo',
                'is_mandatory': True,
                'max_file_size_mb': 5,
                'allowed_formats': 'jpg,jpeg,png'
            },
            {
                'name': 'Justificatif d\'hôtel',
                'description': 'Réservation d\'hôtel ou attestation d\'hébergement',
                'document_type': 'hotel_booking',
                'is_mandatory': True,
                'max_file_size_mb': 5,
                'allowed_formats': 'pdf,jpg,jpeg,png'
            },
        ]

        # Create visa types and required documents
        for vt_data in visa_types:
            visa_type, created = VisaType.objects.get_or_create(
                name=vt_data['name'],
                country=vt_data['country'],
                defaults={
                    'category': vt_data['category'],
                    'description': vt_data['description'],
                    'duration_days': vt_data['duration_days'],
                    'is_active': vt_data['is_active']
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Created visa type: {visa_type.name}'))
                
                # Add required documents to each visa type
                for doc_data in required_docs:
                    doc, _ = RequiredDocument.objects.get_or_create(
                        visa_type=visa_type,
                        name=doc_data['name'],
                        defaults={
                            'description': doc_data['description'],
                            'document_type': doc_data['document_type'],
                            'is_mandatory': doc_data['is_mandatory'],
                            'max_file_size_mb': doc_data['max_file_size_mb'],
                            'allowed_formats': doc_data['allowed_formats']
                        }
                    )
                    self.stdout.write(self.style.SUCCESS(f'  - Added required document: {doc.name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Visa type already exists: {visa_type.name}'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded visa types and documents!'))
