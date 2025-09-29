from django.core.management.base import BaseCommand
from travel.models import Country, VisaType, RequiredDocument

class Command(BaseCommand):
    help = 'Add sample visa types to the database'

    def handle(self, *args, **options):
        # Create or get France
        france, _ = Country.objects.get_or_create(
            name='France',
            code='FR',
            is_active=True
        )
        
        # Create or get Canada
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
                'is_active': True,
                'code': 'FR-TOUR-90'
            },
            {
                'name': 'Visa Affaires',
                'country': france,
                'category': 'business',
                'description': 'Visa pour affaires en France',
                'duration_days': 30,
                'is_active': True,
                'code': 'FR-BUS-30'
            },
            {
                'name': 'Visa Touristique',
                'country': canada,
                'category': 'tourism',
                'description': 'Visa pour tourisme au Canada',
                'duration_days': 180,
                'is_active': True,
                'code': 'CA-TOUR-180'
            }
        ]

        required_docs = [
            {
                'name': 'Passeport',
                'description': 'Passeport valide 6 mois après la date de retour',
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
                'name': 'Justificatif d\'hébergement',
                'description': 'Réservation hôtelière ou attestation d\'accueil',
                'document_type': 'hotel_booking',
                'is_mandatory': True,
                'max_file_size_mb': 5,
                'allowed_formats': 'pdf,jpg,jpeg,png'
            },
        ]

        for vt_data in visa_types:
            # Remove code from vt_data to avoid duplicate field error
            code = vt_data.pop('code', None)
            
            visa_type, created = VisaType.objects.update_or_create(
                name=vt_data['name'],
                country=vt_data['country'],
                defaults={
                    **vt_data,
                    'code': code or f"{vt_data['country'].code}-{vt_data['category'].upper()}-{vt_data['duration_days']}"
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Created visa type: {visa_type.name}'))
                
                # Add required documents
                for doc_data in required_docs:
                    doc, _ = RequiredDocument.objects.get_or_create(
                        visa_type=visa_type,
                        name=doc_data['name'],
                        defaults=doc_data
                    )
                    self.stdout.write(f'  - Added document: {doc.name}')
            else:
                self.stdout.write(self.style.SUCCESS(f'Updated visa type: {visa_type.name}'))

        self.stdout.write(self.style.SUCCESS('Successfully added sample visa types!'))
