from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from travel.models import CurrencyExchangeRequest, ExchangeRate
from core.models import Client
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Seed sample currency exchange requests for testing'

    def handle(self, *args, **options):
        # Get or create a test client
        try:
            client = Client.objects.first()
            if not client:
                # Create a test user and client if none exists
                user, created = User.objects.get_or_create(
                    username='testclient',
                    defaults={
                        'email': 'test@example.com',
                        'first_name': 'Test',
                        'last_name': 'Client'
                    }
                )
                if created:
                    user.set_password('password123')
                    user.save()

                client, created = Client.objects.get_or_create(
                    user=user,
                    defaults={
                        'first_name': 'Test',
                        'last_name': 'Client',
                        'email': 'test@example.com',
                        'phone': '690000000',
                        'pays': 'Cameroun'
                    }
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS('Created test client')
                    )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating test client: {e}')
            )
            return

        # Get exchange rates for creating realistic exchange requests
        try:
            xaf_usd_rate = ExchangeRate.objects.get(from_currency='XAF', to_currency='USD', is_active=True)
            xaf_eur_rate = ExchangeRate.objects.get(from_currency='XAF', to_currency='EUR', is_active=True)
        except ExchangeRate.DoesNotExist:
            self.stdout.write(
                self.style.WARNING('Exchange rates not found. Please run seed_exchange_rates first.')
            )
            return

        # Sample exchange requests
        exchanges_data = [
            {
                'user': client,
                'from_currency': 'XAF',
                'to_currency': 'USD',
                'amount_sent': Decimal('500000'),
                'exchange_rate': xaf_usd_rate.rate,
                'fee_amount': Decimal('10'),
                'fee_percentage': xaf_usd_rate.fee_percentage,
                'amount_received': Decimal('740'),
                'reception_method': 'agency_pickup',
                'pickup_agency': 'agency_douala',
                'status': 'completed',
                'reference': 'EXC2025001',
                'submitted_at': timezone.now(),
                'completed_at': timezone.now()
            },
            {
                'user': client,
                'from_currency': 'XAF',
                'to_currency': 'EUR',
                'amount_sent': Decimal('300000'),
                'exchange_rate': xaf_eur_rate.rate,
                'fee_amount': Decimal('6'),
                'fee_percentage': xaf_eur_rate.fee_percentage,
                'amount_received': Decimal('414'),
                'reception_method': 'bank_transfer',
                'bank_name': 'Société Générale',
                'account_holder_name': 'Test Client',
                'iban': 'FR1420041010050500013M02606',
                'bic': 'SOGEFRPP',
                'status': 'pending',
                'reference': 'EXC2025002',
                'submitted_at': timezone.now()
            },
            {
                'user': client,
                'from_currency': 'USD',
                'to_currency': 'XAF',
                'amount_sent': Decimal('1000'),
                'exchange_rate': Decimal('650.0'),
                'fee_amount': Decimal('13000'),
                'fee_percentage': Decimal('2.0'),
                'amount_received': Decimal('637000'),
                'reception_method': 'mobile_money',
                'mobile_operator': 'orange',
                'mobile_number': '+237691234567',
                'status': 'processing',
                'reference': 'EXC2025003',
                'submitted_at': timezone.now()
            }
        ]

        created_count = 0
        for exchange_data in exchanges_data:
            exchange, created = CurrencyExchangeRequest.objects.get_or_create(
                reference=exchange_data['reference'],
                defaults=exchange_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created exchange request: {exchange.reference} - {exchange.from_currency} {exchange.amount_sent} → {exchange.to_currency} {exchange.amount_received} ({exchange.status})'
                    )
                )
            else:
                self.stdout.write(
                    f'Exchange request already exists: {exchange.reference}'
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully seeded {created_count} currency exchange requests')
        )