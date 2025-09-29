from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import VisaApplication, ApplicationHistory, Appointment

@receiver(post_save, sender=VisaApplication)
def notify_status_change(sender, instance, created, **kwargs):
    if not created and instance.submitted_at:  # Only notify for submitted applications
        # Get the latest history entry
        latest_history = instance.history.order_by('-performed_at').first()
        if latest_history and latest_history.action == 'status_changed':
            # Send email notification
            subject = f"Mise à jour de votre demande de visa - {instance.application_number}"

            message = f"""
Cher/Chère {instance.first_name} {instance.last_name},

Votre demande de visa ({instance.application_number}) pour {instance.visa_type.country.name} a été mise à jour.

Statut actuel: {instance.get_status_display()}

{('Raison du rejet: ' + instance.rejection_reason) if instance.status == 'rejected' else ''}

Vous pouvez suivre l'évolution de votre dossier sur votre espace client.

Cordialement,
L'équipe Global Service Corporation
            """.strip()

            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [instance.email],
                    fail_silently=True
                )
            except Exception as e:
                # Log the error but don't break the application
                print(f"Failed to send notification email: {e}")

@receiver(post_save, sender=ApplicationHistory)
def notify_agent_assignment(sender, instance, created, **kwargs):
    if created and instance.action == 'assigned':
        # Notify the assigned agent
        if instance.application.assigned_agent and instance.application.assigned_agent.email:
            subject = f"Nouvelle demande de visa assignée - {instance.application.application_number}"

            message = f"""
Bonjour {instance.application.assigned_agent.first_name},

Une nouvelle demande de visa vous a été assignée:

- Numéro de demande: {instance.application.application_number}
- Client: {instance.application.first_name} {instance.application.last_name}
- Type de visa: {instance.application.visa_type.name}
- Destination: {instance.application.visa_type.country.name}

Vous pouvez consulter le dossier complet sur votre tableau de bord agent.

Cordialement,
Système de gestion GSC
            """.strip()

            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [instance.application.assigned_agent.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f"Failed to send agent notification email: {e}")

@receiver(post_save, sender=Appointment)
def notify_appointment_created(sender, instance, created, **kwargs):
    if created:
        # Send email notification to the client
        subject = f"Nouveau rendez-vous programmé - {instance.get_reason_display()}"

        message = f"""
Cher/Chère {instance.client.prenom} {instance.client.nom},

Un nouveau rendez-vous a été programmé pour vous :

- Motif : {instance.get_reason_display()}
- Date et heure : {instance.date.strftime('%d/%m/%Y à %H:%M')}
- Lieu : {instance.get_location_display()}
- Agent : {instance.agent.get_full_name() if instance.agent.first_name or instance.agent.last_name else instance.agent.username}

Message de l'agent :
{instance.message}

Documents requis :
{', '.join(instance.required_documents) if instance.required_documents else 'Aucun document spécifique requis'}

Veuillez vous présenter au rendez-vous avec tous les documents nécessaires.
En cas d'empêchement, contactez-nous au plus vite.

Cordialement,
L'équipe Global Service Corporation
        """.strip()

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [instance.client.email],
                fail_silently=True
            )
        except Exception as e:
            # Log the error but don't break the application
            print(f"Failed to send appointment notification email: {e}")