from django.core.management.base import BaseCommand
from travel.models import ExchangeRate
from decimal import Decimal

class Command(BaseCommand):
    help = 'Seed initial exchange rates for currency exchange module'

    def handle(self, *args, **options):
        # Sample exchange rates (these are fictional rates for demonstration)
        rates_data = [
            # XAF to other currencies
            {'from_currency': 'XAF', 'to_currency': 'USD', 'rate': Decimal('0.0015'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'XAF', 'to_currency': 'EUR', 'rate': Decimal('0.0014'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'XAF', 'to_currency': 'CAD', 'rate': Decimal('0.0020'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'XAF', 'to_currency': 'GBP', 'rate': Decimal('0.0012'), 'fee_percentage': Decimal('2.0')},

            # USD to other currencies
            {'from_currency': 'USD', 'to_currency': 'XAF', 'rate': Decimal('650.0'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'USD', 'to_currency': 'EUR', 'rate': Decimal('0.92'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'USD', 'to_currency': 'CAD', 'rate': Decimal('1.35'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'USD', 'to_currency': 'GBP', 'rate': Decimal('0.78'), 'fee_percentage': Decimal('2.0')},

            # EUR to other currencies
            {'from_currency': 'EUR', 'to_currency': 'XAF', 'rate': Decimal('710.0'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'EUR', 'to_currency': 'USD', 'rate': Decimal('1.09'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'EUR', 'to_currency': 'CAD', 'rate': Decimal('1.47'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'EUR', 'to_currency': 'GBP', 'rate': Decimal('0.85'), 'fee_percentage': Decimal('2.0')},

            # CAD to other currencies
            {'from_currency': 'CAD', 'to_currency': 'XAF', 'rate': Decimal('485.0'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'CAD', 'to_currency': 'USD', 'rate': Decimal('0.74'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'CAD', 'to_currency': 'EUR', 'rate': Decimal('0.68'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'CAD', 'to_currency': 'GBP', 'rate': Decimal('0.58'), 'fee_percentage': Decimal('2.0')},

            # GBP to other currencies
            {'from_currency': 'GBP', 'to_currency': 'XAF', 'rate': Decimal('835.0'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'GBP', 'to_currency': 'USD', 'rate': Decimal('1.28'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'GBP', 'to_currency': 'EUR', 'rate': Decimal('1.18'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'GBP', 'to_currency': 'CAD', 'rate': Decimal('1.73'), 'fee_percentage': Decimal('2.0')},
        ]

        created_count = 0
        for rate_data in rates_data:
            rate, created = ExchangeRate.objects.get_or_create(
                from_currency=rate_data['from_currency'],
                to_currency=rate_data['to_currency'],
                defaults=rate_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created rate: {rate.from_currency} → {rate.to_currency} = {rate.rate}'
                    )
                )
            else:
                self.stdout.write(
                    f'Rate already exists: {rate.from_currency} → {rate.to_currency}'
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully seeded {created_count} exchange rates')
        )

class Command(BaseCommand):
    help = 'Seed initial exchange rates for currency exchange module'

    def handle(self, *args, **options):
        # Sample exchange rates (these are fictional rates for demonstration)
        rates_data = [
            # XAF to other currencies
            {'from_currency': 'XAF', 'to_currency': 'USD', 'rate': Decimal('0.0015'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'XAF', 'to_currency': 'EUR', 'rate': Decimal('0.0014'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'XAF', 'to_currency': 'CAD', 'rate': Decimal('0.0020'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'XAF', 'to_currency': 'GBP', 'rate': Decimal('0.0012'), 'fee_percentage': Decimal('2.0')},

            # USD to other currencies
            {'from_currency': 'USD', 'to_currency': 'XAF', 'rate': Decimal('650.0'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'USD', 'to_currency': 'EUR', 'rate': Decimal('0.92'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'USD', 'to_currency': 'CAD', 'rate': Decimal('1.35'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'USD', 'to_currency': 'GBP', 'rate': Decimal('0.78'), 'fee_percentage': Decimal('2.0')},

            # EUR to other currencies
            {'from_currency': 'EUR', 'to_currency': 'XAF', 'rate': Decimal('710.0'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'EUR', 'to_currency': 'USD', 'rate': Decimal('1.09'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'EUR', 'to_currency': 'CAD', 'rate': Decimal('1.47'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'EUR', 'to_currency': 'GBP', 'rate': Decimal('0.85'), 'fee_percentage': Decimal('2.0')},

            # CAD to other currencies
            {'from_currency': 'CAD', 'to_currency': 'XAF', 'rate': Decimal('485.0'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'CAD', 'to_currency': 'USD', 'rate': Decimal('0.74'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'CAD', 'to_currency': 'EUR', 'rate': Decimal('0.68'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'CAD', 'to_currency': 'GBP', 'rate': Decimal('0.58'), 'fee_percentage': Decimal('2.0')},

            # GBP to other currencies
            {'from_currency': 'GBP', 'to_currency': 'XAF', 'rate': Decimal('835.0'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'GBP', 'to_currency': 'USD', 'rate': Decimal('1.28'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'GBP', 'to_currency': 'EUR', 'rate': Decimal('1.18'), 'fee_percentage': Decimal('2.0')},
            {'from_currency': 'GBP', 'to_currency': 'CAD', 'rate': Decimal('1.73'), 'fee_percentage': Decimal('2.0')},
        ]

        created_count = 0
        for rate_data in rates_data:
            rate, created = ExchangeRate.objects.get_or_create(
                from_currency=rate_data['from_currency'],
                to_currency=rate_data['to_currency'],
                defaults=rate_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created rate: {rate.from_currency} → {rate.to_currency} = {rate.rate}'
                    )
                )
            else:
                self.stdout.write(
                    f'Rate already exists: {rate.from_currency} → {rate.to_currency}'
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully seeded {created_count} exchange rates')
        )