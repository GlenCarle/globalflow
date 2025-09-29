import React from 'react';
import { CheckCircle, FileText, MapPin, Calendar, User, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

const VisaApplicationStep4 = ({ formData, application, visaTypes }) => {
  const visaType = visaTypes.find(v => v.id === parseInt(formData.visa_type));

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getMaritalStatusLabel = (status) => {
    const statuses = {
      'single': 'Célibataire',
      'married': 'Marié(e)',
      'divorced': 'Divorcé(e)',
      'widowed': 'Veuf/Veuve',
    };
    return statuses[status] || status;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Récapitulatif de votre demande</h2>
        <p className="text-gray-600">Vérifiez toutes les informations avant de soumettre votre demande</p>
      </div>

      {/* Visa Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informations du visa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Type de visa</label>
              <p className="font-medium">{visaType?.name || 'Non spécifié'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Destination</label>
              <p className="font-medium">{visaType?.country_name || 'Non spécifié'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date d'arrivée</label>
              <p className="font-medium">{formatDate(formData.intended_date_of_arrival)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date de départ</label>
              <p className="font-medium">{formatDate(formData.intended_date_of_departure)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Durée du séjour</label>
              <p className="font-medium">{formData.length_of_stay_days} jours</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Lieu de résidence actuel</label>
              <p className="font-medium">{formData.current_address || 'Non spécifié'}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Motif du voyage</label>
            <p className="mt-1 p-3 bg-gray-50 rounded-md">{formData.purpose_of_visit || 'Non spécifié'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Prénom</label>
              <p className="font-medium">{formData.first_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nom de famille</label>
              <p className="font-medium">{formData.last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date de naissance</label>
              <p className="font-medium">{formatDate(formData.date_of_birth)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Lieu de naissance</label>
              <p className="font-medium">{formData.place_of_birth || 'Non spécifié'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nationalité</label>
              <p className="font-medium">{formData.nationality}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">État civil</label>
              <p className="font-medium">{getMaritalStatusLabel(formData.marital_status) || 'Non spécifié'}</p>
            </div>
          </div>

          {formData.marital_status === 'married' && (
            <div>
              <label className="text-sm font-medium text-gray-500">Nom du conjoint</label>
              <p className="font-medium">{formData.spouse_name || 'Non spécifié'}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500">Nombre d'enfants</label>
            <p className="font-medium">{formData.number_of_children || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Informations de contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Adresse actuelle</label>
            <p className="font-medium whitespace-pre-line">{formData.current_address}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Téléphone</label>
              <p className="font-medium">{formData.phone_number || 'Non spécifié'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="font-medium">{formData.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Informations professionnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Profession</label>
              <p className="font-medium">{formData.occupation || 'Non spécifié'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Employeur</label>
              <p className="font-medium">{formData.employer_name || 'Non spécifié'}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Adresse de l'employeur</label>
            <p className="font-medium whitespace-pre-line">{formData.employer_address || 'Non spécifié'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Revenus mensuels</label>
            <p className="font-medium">{formData.monthly_income ? `${formData.monthly_income} €` : 'Non spécifié'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Documents Status */}
      {application && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Statut des documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Documents téléversés</span>
                <Badge variant="secondary">
                  {application.documents?.length || 0} documents
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Documents approuvés</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {application.documents?.filter(doc => doc.status === 'approved').length || 0} approuvés
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Documents en attente</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {application.documents?.filter(doc => doc.status === 'pending').length || 0} en attente
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notice */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                <span className="text-yellow-800 text-sm font-bold">!</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">Important</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Assurez-vous que toutes les informations sont exactes et à jour</li>
                <li>• Tous les documents obligatoires doivent être téléversés et approuvés</li>
                <li>• Après soumission, votre demande sera examinée par notre équipe</li>
                <li>• Vous recevrez une confirmation par email une fois la demande soumise</li>
                <li>• Le délai de traitement peut varier selon le type de visa et la destination</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisaApplicationStep4;