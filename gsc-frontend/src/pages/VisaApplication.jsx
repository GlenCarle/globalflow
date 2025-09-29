import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Save, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../contexts/AuthContext';
import { CLIENT_ROUTES } from '../constants/routes';
import axios from '../lib/axios';

// Step Components
import VisaApplicationStep1 from '../components/visa/VisaApplicationStep1';
import VisaApplicationStep2 from '../components/visa/VisaApplicationStep2';
import VisaApplicationStep3 from '../components/visa/VisaApplicationStep3';
import VisaApplicationStep4 from '../components/visa/VisaApplicationStep4';

const VisaApplication = () => {
  const { id } = useParams(); // For editing existing application
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [application, setApplication] = useState(null);
  const [visaTypes, setVisaTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form data
  const [formData, setFormData] = useState(() => {
    // Get questionnaire data from localStorage if it exists
    const questionnaireData = JSON.parse(localStorage.getItem('immigrationFormData') || 'null');

    // Map questionnaire data to visa application form fields
    const mapQuestionnaireData = (data) => {
      if (!data) return {};

      // Map purpose of visit
      const purposeMap = {
        'study': 'Études',
        'work': 'Travail',
        'family': 'Regroupement familial',
        'tourism': 'Tourisme',
        'business': 'Affaires',
        'other': 'Autre'
      };

      // Map destination to country for filtering visa types
      const destinationMap = {
        'canada': 'Canada',
        'usa': 'États-Unis',
        'france': 'France',
        'uk': 'Royaume-Uni',
        'germany': 'Allemagne',
        'australia': 'Australie'
      };

      return {
        // Will be set after loading visa types based on destination
        visa_type: '',
        purpose_of_visit: purposeMap[data.purpose] || '',
        nationality: data.nationality || '',
        current_address: data.currentLocation || '',

        // Set default dates based on timeline
        ...(data.timeline === 'asap' && {
          intended_date_of_departure: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          length_of_stay_days: '30'
        }),
        ...(data.timeline === '1-3months' && {
          intended_date_of_departure: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 months from now
          length_of_stay_days: '60'
        }),
        ...(data.timeline === '3-6months' && {
          intended_date_of_departure: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months from now
          length_of_stay_days: '90'
        }),

        // Store destination for later use in visa type selection
        selected_destination: destinationMap[data.destination] || data.destination
      };
    };

    // Initial form data with user info and mapped questionnaire data
    return {
      // Step 1: Visa Selection
      visa_type: '',
      purpose_of_visit: '',
      intended_date_of_departure: '',
      length_of_stay_days: '',

      // Step 2: Personal Information
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      date_of_birth: null,
      place_of_birth: 'Non spécifié',
      nationality: '',
      current_address: '',
      phone_number: user?.profile?.phone || '0000000000',
      email: user?.email || '',
      marital_status: 'single',
      spouse_name: '',
      number_of_children: 0,
      occupation: 'Non spécifié',
      employer_name: '',
      employer_address: '',
      monthly_income: '',

      // Merge with questionnaire data
      ...mapQuestionnaireData(questionnaireData)
    };
  });

  // Load initial data and application (if editing)
  useEffect(() => {
    const initialize = async () => {
      await loadInitialData();
      
      // Only try to load application if we have an ID (editing existing application)
      if (id && id !== 'new') {
        await loadApplication();
      }
    };
    
    initialize();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [visaTypesRes, countriesRes] = await Promise.all([
        axios.get('/travel/api/visa-types/').catch(err => {
          console.error('Error loading visa types:', err);
          return { data: [] };
        }),
        axios.get('/travel/api/countries/').catch(err => {
          console.error('Error loading countries:', err);
          return { data: [] };
        })
      ]);

      const visaTypes = Array.isArray(visaTypesRes.data) ? visaTypesRes.data : [];
      const countries = Array.isArray(countriesRes.data) ? countriesRes.data : [];
      
      setVisaTypes(visaTypes);
      setCountries(countries);
      
      if (visaTypes.length === 0) {
        setError('Aucun type de visa disponible. Veuillez contacter le support technique.');
      }
      
      if (countries.length === 0) {
        setError(prev => prev ? `${prev} Également, aucune donnée de pays disponible.` : 'Aucune donnée de pays disponible.');
      }

      // Try to set visa type based on questionnaire data
      const questionnaireData = JSON.parse(localStorage.getItem('immigrationFormData') || 'null');
      if (questionnaireData?.selected_destination && questionnaireData?.purpose) {
        // Use the processed destination name from assistant
        const countryName = questionnaireData.selected_destination;

        // Find country by name
        const targetCountry = countriesRes.data.find(country =>
          country.name.toLowerCase() === countryName.toLowerCase()
        );

        if (targetCountry) {
          // Find visa types for this country
          const countryVisaTypes = visaTypes.filter(type => type.country === targetCountry.id);

          // Map questionnaire purpose to visa category
          const purposeCategoryMap = {
            'study': 'student',
            'work': 'work',
            'family': 'family',
            'tourism': 'tourism',
            'business': 'business',
            'other': 'other'
          };

          const targetCategory = purposeCategoryMap[questionnaireData.purpose];

          // Find the best matching visa type
          let matchingType = null;

          // First try to find exact category match
          if (targetCategory) {
            matchingType = countryVisaTypes.find(type => type.category === targetCategory);
          }

          // If no exact match, find any active visa type for the country
          if (!matchingType) {
            matchingType = countryVisaTypes.find(type => type.is_active);
          }

          if (matchingType) {
            setFormData(prev => ({
              ...prev,
              visa_type: matchingType.id.toString(),
              // Update length of stay based on visa type if not already set from timeline
              ...(matchingType.max_duration_days && !prev.length_of_stay_days && {
                length_of_stay_days: Math.min(matchingType.max_duration_days, 90).toString()
              })
            }));
          }
        }

        // Clear the questionnaire data from localStorage after using it
        localStorage.removeItem('immigrationFormData');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Erreur lors du chargement des données');
    }
    finally {
    setLoading(false);
  }
  };

  const loadApplication = async () => {
    if (!id || id === 'new') {
      // Skip loading for new applications
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/travel/api/visa-applications/${id}/`);
      const app = response.data;
      setApplication(app);

      // Reverse country ID mapping (backend integer PKs to frontend string IDs)
      const reverseCountryIdMap = {
        1: 'france',
        2: 'canada',
        3: 'usa',
        4: 'uk',
        5: 'germany',
        6: 'australia'
      };

      // Populate form data
      setFormData({
        visa_type: app.visa_type ? app.visa_type.toString() : '',
        purpose_of_visit: app.purpose_of_visit,
        intended_date_of_departure: app.intended_date_of_departure,
        length_of_stay_days: app.length_of_stay_days,
        first_name: app.first_name,
        last_name: app.last_name,
        date_of_birth: app.date_of_birth,
        place_of_birth: app.place_of_birth,
        nationality: app.nationality,
        current_address: app.current_address,
        currentCountry: app.country ? reverseCountryIdMap[app.country] : '', // Map backend country to frontend currentCountry
        currentCity: app.city, // Map backend city to frontend currentCity
        phone_number: app.phone_number,
        email: app.email,
        marital_status: app.marital_status,
        spouse_name: app.spouse_name,
        number_of_children: app.number_of_children,
        occupation: app.occupation,
        employer_name: app.employer_name,
        employer_address: app.employer_address,
        monthly_income: app.monthly_income,
      });
    } catch (error) {
      console.error('Error loading application:', error);
      setError('Erreur lors du chargement de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveDraft = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validate required fields for draft saving
      const errors = [];
      
      if (!formData.visa_type) {
        errors.push('Veuillez sélectionner un type de visa');
      }

      if (!formData.nationality) {
        errors.push('Veuillez renseigner votre nationalité');
      }

      if (!formData.purpose_of_visit) {
        errors.push('Veuillez indiquer le motif du voyage');
      }
      
      if (errors.length > 0) {
        setError(errors.join('. '));
        return;
      }

      // Parse and validate visa_type
      const visaTypeId = parseInt(formData.visa_type);
      if (isNaN(visaTypeId) || visaTypeId <= 0) {
        setError('Type de visa invalide. Veuillez sélectionner un type de visa valide.');
        return;
      }

      // If we have visa types loaded, validate against them
      if (visaTypes.length > 0) {
        const selectedVisaType = visaTypes.find(type => type.id === visaTypeId);
        if (!selectedVisaType) {
          setError('Type de visa sélectionné introuvable. Veuillez rafraîchir la page.');
          return;
        }
      }

      // Country ID mapping (frontend string IDs to backend integer PKs)
      // Note: Using null since actual PKs are unknown - backend allows null
      const countryIdMap = {
        'france': null,
        'canada': null,
        'usa': null,
        'uk': null,
        'germany': null,
        'australia': null
      };

      // Map form field names to backend field names
      const data = {
        ...formData,
        // Map frontend field names to backend field names
        country: formData.currentCountry ? countryIdMap[formData.currentCountry] : null,
        city: formData.currentCity || null,
        visa_type: visaTypeId,
        // Handle date fields - send null for empty dates
        date_of_birth: formData.date_of_birth || null,
        intended_date_of_arrival: formData.intended_date_of_arrival || null,
        intended_date_of_departure: formData.intended_date_of_departure || null,
        passport_issue_date: formData.passport_issue_date || null,
        passport_expiry_date: formData.passport_expiry_date || null,
        // Remove frontend-specific fields that don't exist in backend
        currentCountry: undefined,
        currentCity: undefined,
        status: 'draft'
      };

      // Remove undefined fields
      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

      console.log('Sending draft data:', data); // Debug log

      let response;
      if (id) {
        response = await axios.patch(`/travel/api/visa-applications/${id}/`, data);
      } else {
        response = await axios.post('/travel/api/visa-applications/', data);
        if (response.data.id) {
          navigate(`/dashboard/visa-applications/${response.data.id}`, { replace: true });
        }
      }

      setApplication(response.data);
      setSuccess('Brouillon sauvegardé avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      console.error('Error response:', error.response?.data);

      // Extract error message from various possible formats
      let errorMessage = 'Erreur lors de la sauvegarde du brouillon';

      if (error.response?.data) {
        const data = error.response.data;

        // Check for field-specific errors
        if (data.visa_type && Array.isArray(data.visa_type)) {
          errorMessage = `Type de visa: ${data.visa_type[0]}`;
        } else if (data.applicant && Array.isArray(data.applicant)) {
          errorMessage = `Demandeur: ${data.applicant[0]}`;
        } else if (data.nationality && Array.isArray(data.nationality)) {
          errorMessage = `Nationalité: ${data.nationality[0]}`;
        } else if (data.first_name && Array.isArray(data.first_name)) {
          errorMessage = `Prénom: ${data.first_name[0]}`;
        } else if (data.last_name && Array.isArray(data.last_name)) {
          errorMessage = `Nom: ${data.last_name[0]}`;
        } else if (data.email && Array.isArray(data.email)) {
          errorMessage = `Email: ${data.email[0]}`;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else {
          // Generic error from non-field errors
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            errorMessage = `${firstKey}: ${data[firstKey][0]}`;
          }
        }
      }

      // Check if this is a duplicate application error
      if (error.response?.status === 400 && error.response?.data?.error &&
          error.response.data.error.includes('déjà une demande en cours')) {
        // Redirect to duplicate application page with error message
        navigate(CLIENT_ROUTES.VISA_APPLICATION_DUPLICATE, {
          state: {
            errorMessage: error.response.data.error
          }
        });
        return;
      }

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const submitApplication = async () => {
    try {
      setSaving(true);
      setError(null);

      await axios.post(`/travel/api/visa-applications/${application.id}/submit/`);
      setSuccess('Demande soumise avec succès !');
      setTimeout(() => {
        navigate(CLIENT_ROUTES.APPLICATIONS);
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error.response?.data?.error || 'Erreur lors de la soumission');
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      // Auto-save draft on step change if we have basic data
      if (currentStep === 1 && formData.visa_type) {
        saveDraft();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        // Require visa type selection along with nationality and purpose
        return formData.visa_type && formData.nationality && formData.purpose_of_visit;
      case 2:
        return formData.first_name && formData.last_name && formData.date_of_birth &&
                formData.nationality && formData.current_address && formData.email;
      case 3:
        // Document validation will be handled in step 3 component
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(CLIENT_ROUTES.APPLICATIONS)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux demandes
        </button>
        <h1 className="text-3xl font-bold text-gray-800">
          {id ? 'Modifier la demande de visa' : 'Nouvelle demande de visa'}
        </h1>
        <p className="text-gray-600 mt-2">
          Remplissez les informations requises pour votre demande de visa
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                step < currentStep ? 'bg-green-500 text-white' :
                step === currentStep ? 'bg-primary text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Sélection du visa</span>
          <span>Informations personnelles</span>
          <span>Documents</span>
          <span>Récapitulatif</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <div>{error}</div>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <div>{success}</div>
        </Alert>
      )}

      {/* Step Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <VisaApplicationStep1
              formData={formData}
              onChange={handleInputChange}
              visaTypes={visaTypes}
              countries={countries}
            />
          )}
          {currentStep === 2 && (
            <VisaApplicationStep2
              formData={formData}
              onChange={handleInputChange}
            />
          )}
          {currentStep === 3 && (
            <VisaApplicationStep3
              application={application}
              visaTypes={visaTypes}
              formData={formData}
              onChange={handleInputChange}
            />
          )}
          {currentStep === 4 && (
            <VisaApplicationStep4
              formData={formData}
              application={application}
              visaTypes={visaTypes}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Précédent
        </Button>

        <div className="flex gap-4">
          {currentStep < 4 && (
            <Button
              variant="outline"
              onClick={saveDraft}
              disabled={saving || !(formData.visa_type && formData.nationality && formData.purpose_of_visit)}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder brouillon
                </>
              )}
            </Button>
          )}

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceedToNext()}
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={submitApplication}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Soumission...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Soumettre la demande
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisaApplication;