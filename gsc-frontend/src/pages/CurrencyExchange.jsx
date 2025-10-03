import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { CheckCircle, ArrowRight, ArrowLeft, Calculator, CreditCard, MapPin, Building, Smartphone, Clock, History } from 'lucide-react';
import { simulateExchange, saveSimulationToHistory, getSimulationHistory, CURRENCIES } from '../constants/exchangeRates';
import { useToast } from '../components/ui/use-toast';

const steps = [
  'Simulation d\'échange',
  'Informations de réception',
  'Récapitulatif',
  'Confirmation'
];

// Utilisation des devises depuis le fichier de constantes
const currencies = CURRENCIES;

const receptionMethods = [
  { value: 'agency_pickup', label: 'Retrait en agence', icon: Building },
  { value: 'bank_transfer', label: 'Virement bancaire', icon: CreditCard },
  { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
];

export default function CurrencyExchange() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exchangeData, setExchangeData] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Step 1: Simulation data
  const [simulationData, setSimulationData] = useState({
    fromCurrency: 'XAF',
    toCurrency: 'USD',
    amount: ''
  });

  // Step 2: Reception data
  const [receptionData, setReceptionData] = useState({
    method: '',
    agency: '',
    bankName: '',
    accountHolderName: '',
    iban: '',
    bic: '',
    mobileOperator: '',
    mobileNumber: ''
  });

  // Step 3: Additional data
  const [additionalData, setAdditionalData] = useState({
    notes: ''
  });

  useEffect(() => {
    if (simulationData.amount && !isNaN(simulationData.amount)) {
      handleSimulation();
    }
  }, [simulationData.fromCurrency, simulationData.toCurrency, simulationData.amount]);

  const handleSimulation = () => {
    if (!simulationData.amount || isNaN(simulationData.amount) || parseFloat(simulationData.amount) <= 0) {
      setSimulation(null);
      return;
    }

    const result = simulateExchange(
      simulationData.fromCurrency,
      simulationData.toCurrency,
      parseFloat(simulationData.amount)
    );

    if (result.success) {
      setSimulation(result);
    } else {
      setSimulation(null);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Autoriser uniquement les nombres et un point décimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSimulationData({ ...simulationData, amount: value });
    }
  };

  // Fonction pour inverser les devises
  const swapCurrencies = () => {
    const newFromCurrency = simulationData.toCurrency;
    const newToCurrency = simulationData.fromCurrency;
    
    // Si on a une simulation valide et un montant converti, on le garde
    const newAmount = simulation?.converted_amount 
      ? parseFloat(simulation.converted_amount).toFixed(2)
      : simulationData.amount; // Garder l'ancien montant si pas de simulation

    setSimulationData({
      ...simulationData,
      fromCurrency: newFromCurrency,
      toCurrency: newToCurrency,
      amount: newAmount
    });
    
    // Réinitialiser la simulation après l'échange des devises
    setSimulation(null);
  };

  // Gestion de la navigation entre les étapes
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Soumission de la demande d'échange
  const submitExchangeRequest = async () => {
    setLoading(true);
    try {
      // Generate unique reference
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const reference = `EXC${timestamp}${randomSuffix}`;

      console.log('Generated reference:', reference); // Debug log

      // Préparer les données de la transaction
      const exchangeRequestData = {
        reference: reference,
        from_currency: simulationData.fromCurrency,
        to_currency: simulationData.toCurrency,
        amount_sent: parseFloat(simulationData.amount),
        exchange_rate: simulation.exchange_rate,
        fee_amount: simulation.fee_amount,
        fee_percentage: simulation.fee_percentage,
        amount_received: simulation.net_received,
        reception_method: receptionData.method,
        status: 'pending',  // Submit directly as pending instead of draft
        notes: additionalData.notes
      };

      // Add reception method specific fields only if they exist
      if (receptionData.agency) exchangeRequestData.pickup_agency = receptionData.agency;
      if (receptionData.bankName) exchangeRequestData.bank_name = receptionData.bankName;
      if (receptionData.accountHolderName) exchangeRequestData.account_holder_name = receptionData.accountHolderName;
      if (receptionData.iban) exchangeRequestData.iban = receptionData.iban;
      if (receptionData.bic) exchangeRequestData.bic = receptionData.bic;
      if (receptionData.mobileOperator) exchangeRequestData.mobile_operator = receptionData.mobileOperator;
      if (receptionData.mobileNumber) exchangeRequestData.mobile_number = receptionData.mobileNumber;

      console.log('Exchange request data:', exchangeRequestData); // Debug log

      // Envoyer la demande à l'API
      const response = await api.post('/travel/api/currency-exchanges/', exchangeRequestData);

      // Mettre à jour l'état avec les données de la transaction
      setExchangeData(response.data);

      // Passer à l'étape suivante
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la soumission de votre demande',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Gestion de la navigation vers l'étape suivante
  const handleNext = async () => {
    if (currentStep === 0) {
      // Vérifier que la simulation est valide
      if (!simulation) {
        alert('Veuillez effectuer une simulation valide avant de continuer');
        return;
      }
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 1) {
      // Vérifier que les informations de réception sont complètes
      if (!receptionData.method) {
        alert('Veuillez sélectionner un mode de réception');
        return;
      }
      
      // Validation spécifique selon la méthode de réception
      if (receptionData.method === 'agency_pickup' && !receptionData.agency) {
        alert('Veuillez sélectionner une agence de retrait');
        return;
      }
      
      if (receptionData.method === 'bank_transfer' && (
        !receptionData.bankName || 
        !receptionData.accountHolderName || 
        !receptionData.iban || 
        !receptionData.bic
      )) {
        alert('Veuillez remplir tous les champs obligatoires pour le virement bancaire');
        return;
      }
      
      if (receptionData.method === 'mobile_money' && (
        !receptionData.mobileOperator || 
        !receptionData.mobileNumber
      )) {
        alert('Veuillez remplir tous les champs obligatoires pour le paiement mobile');
        return;
      }
      
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      await submitExchangeRequest();
    }
  };
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async () => {
    if (currentStep === 0) {
      handleSimulation();
      if (simulation) {
        setCurrentStep(1);
      }
    } else if (currentStep === 2) {
      await submitExchangeRequest();
    } else {
      await handleNext();
    }
  };

  // Rendu des champs de réception en fonction de la méthode sélectionnée
  const renderReceptionFields = () => {
    switch (receptionData.method) {
      case 'agency_pickup':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Agence de retrait</label>
            <Select 
              value={receptionData.agency} 
              onValueChange={(value) => setReceptionData({...receptionData, agency: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une agence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agency_douala">Agence Douala</SelectItem>
                <SelectItem value="agency_yaounde">Agence Yaoundé</SelectItem>
                <SelectItem value="agency_garoua">Agence Garoua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom de la banque</label>
              <Input
                value={receptionData.bankName}
                onChange={(e) => setReceptionData({...receptionData, bankName: e.target.value})}
                placeholder="Ex: Société Générale"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Titulaire du compte</label>
              <Input
                value={receptionData.accountHolderName}
                onChange={(e) => setReceptionData({...receptionData, accountHolderName: e.target.value})}
                placeholder="Nom complet du titulaire"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">IBAN</label>
              <Input
                value={receptionData.iban}
                onChange={(e) => setReceptionData({...receptionData, iban: e.target.value.toUpperCase()})}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">BIC/SWIFT</label>
              <Input
                value={receptionData.bic}
                onChange={(e) => setReceptionData({...receptionData, bic: e.target.value.toUpperCase()})}
                placeholder="BNPAFRPP"
                required
              />
            </div>
          </div>
        );

      case 'mobile_money':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Opérateur mobile</label>
              <Select 
                value={receptionData.mobileOperator} 
                onValueChange={(value) => setReceptionData({...receptionData, mobileOperator: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un opérateur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orange">Orange Money</SelectItem>
                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                  <SelectItem value="airtel">Airtel Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Numéro mobile</label>
              <Input
                value={receptionData.mobileNumber}
                onChange={(e) => setReceptionData({...receptionData, mobileNumber: e.target.value})}
                placeholder="Ex: +237 6XX XXX XXX"
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Rendu du composant
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl">
      {/* En-tête avec étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index <= currentStep
                  ? 'bg-primary border-primary text-white'
                  : 'border-gray-300 text-gray-300'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`ml-2 mr-4 text-sm ${
                index <= currentStep ? 'text-primary font-semibold' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-primary' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Contenu de l'étape courante */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* Étape 1: Simulation d'échange */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">Simulation d'échange de devise</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Calculez le montant que vous recevrez pour votre échange
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Devise à échanger</label>
                    <Select 
                      value={simulationData.fromCurrency} 
                      onValueChange={(value) =>
                        setSimulationData({...simulationData, fromCurrency: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={swapCurrencies}
                      className="mb-2 mx-auto"
                      type="button"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Devise à recevoir</label>
                    <Select 
                      value={simulationData.toCurrency} 
                      onValueChange={(value) =>
                        setSimulationData({...simulationData, toCurrency: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Montant à envoyer</label>
                  <Input
                    type="text"
                    value={simulationData.amount}
                    onChange={handleAmountChange}
                    placeholder="Entrez le montant"
                    className="text-right text-lg font-medium"
                  />
                </div>

                {simulation && (
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Montant envoyé</p>
                          <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                            {simulation.amount_sent || simulation.amount || '0.00'} {simulation.from_currency || ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Montant net reçu</p>
                          <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                            {simulation.net_received ? Number(simulation.net_received).toFixed(2) : '0.00'} {simulation.to_currency || ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Taux de change</p>
                          <p className="text-sm font-medium">
                            1 {simulation.from_currency || ''} = {simulation.exchange_rate || simulation.rate || '0.00'} {simulation.to_currency || ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Frais ({simulation.fee_percentage ? Number(simulation.fee_percentage).toFixed(2) : '0.00'}%)
                          </p>
                          <p className="text-sm font-medium">
                            {simulation.fee_amount ? Number(simulation.fee_amount).toFixed(2) : '0.00'} {simulation.to_currency || ''}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Étape 2: Informations de réception */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">Informations de réception</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choisissez comment vous souhaitez recevoir vos devises
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-4">Mode de réception</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {receptionMethods.map(method => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.value}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            receptionData.method === method.value
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-primary/50'
                          }`}
                          onClick={() => setReceptionData({...receptionData, method: method.value})}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-6 w-6 text-primary" />
                            <span className="font-medium">{method.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {receptionData.method && (
                  <div className="mt-8">
                    <h3 className="font-semibold mb-4">Détails de {receptionMethods.find(m => m.value === receptionData.method)?.label.toLowerCase()}</h3>
                    {renderReceptionFields()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Étape 3: Récapitulatif */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">Récapitulatif de la demande</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Vérifiez les informations avant de soumettre votre demande
              </p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Détails de l'échange</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Montant à envoyer</p>
                        <p className="font-medium">{simulationData.amount} {simulationData.fromCurrency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Montant à recevoir</p>
                        <p className="font-medium">
                          {simulation.net_received.toFixed(2)} {simulationData.toCurrency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Taux de change</p>
                        <p className="font-medium">1 {simulationData.fromCurrency} = {simulation.exchange_rate} {simulationData.toCurrency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Frais ({simulation.fee_percentage}%)</p>
                        <p className="font-medium">{simulation.fee_amount.toFixed(2)} {simulationData.toCurrency}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Mode de réception</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="font-medium">
                      {receptionMethods.find(m => m.value === receptionData.method)?.label}
                    </p>
                    
                    {receptionData.method === 'agency_pickup' && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">Agence: {receptionData.agency}</p>
                      </div>
                    )}

                    {receptionData.method === 'bank_transfer' && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">Banque: {receptionData.bankName}</p>
                        <p className="text-sm">Titulaire: {receptionData.accountHolderName}</p>
                        <p className="text-sm">IBAN: {receptionData.iban}</p>
                        <p className="text-sm">BIC/SWIFT: {receptionData.bic}</p>
                      </div>
                    )}

                    {receptionData.method === 'mobile_money' && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">Opérateur: {
                          receptionData.mobileOperator === 'orange' ? 'Orange Money' :
                          receptionData.mobileOperator === 'mtn' ? 'MTN Mobile Money' :
                          receptionData.mobileOperator === 'airtel' ? 'Airtel Money' : ''
                        }</p>
                        <p className="text-sm">Numéro: {receptionData.mobileNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes supplémentaires (optionnel)</label>
                  <Textarea
                    value={additionalData.notes}
                    onChange={(e) => setAdditionalData({...additionalData, notes: e.target.value})}
                    placeholder="Ajoutez des informations complémentaires..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start">
                    <span className="mr-2">⚠️</span>
                    <span>Aucun paiement n'est effectué en ligne. Votre demande sera traitée par un agent de l'agence. Vous serez notifié une fois l'échange effectué.</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Étape 4: Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-primary">Demande soumise avec succès !</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Votre demande d'échange de devise a été enregistrée et est en attente de traitement par notre équipe.
              Vous recevrez une notification dès qu'elle sera traitée.
            </p>

            {exchangeData && (
              <Card className="max-w-lg mx-auto mt-8">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Référence:</span>
                      <Badge variant="outline">{exchangeData.reference}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Statut:</span>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                        {exchangeData.status_display || 'En attente'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Montant envoyé:</span>
                      <span className="font-semibold">{exchangeData.amount_sent} {exchangeData.from_currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Montant à recevoir:</span>
                      <span className="font-semibold">{exchangeData.amount_received} {exchangeData.to_currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span>{new Date(exchangeData.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
                Retour au tableau de bord
              </Button>
              <Button 
                onClick={() => {
                  // Réinitialiser le formulaire
                  setCurrentStep(0);
                  setSimulationData({
                    fromCurrency: 'XAF',
                    toCurrency: 'USD',
                    amount: ''
                  });
                  setReceptionData({
                    method: '',
                    agency: '',
                    bankName: '',
                    accountHolderName: '',
                    iban: '',
                    bic: '',
                    mobileOperator: '',
                    mobileNumber: ''
                  });
                  setAdditionalData({
                    notes: ''
                  });
                  setSimulation(null);
                }}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Nouvel échange
              </Button>
            </div>
          </div>
        )}

        {/* Boutons de navigation */}
        {currentStep < 3 && (
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 0 || loading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>

            {currentStep === 2 ? (
              <Button
                onClick={handleSubmit}
                disabled={
                  loading || 
                  !receptionData.method ||
                  (receptionData.method === 'agency_pickup' && !receptionData.agency) ||
                  (receptionData.method === 'bank_transfer' && (
                    !receptionData.bankName || 
                    !receptionData.accountHolderName || 
                    !receptionData.iban || 
                    !receptionData.bic
                  )) ||
                  (receptionData.method === 'mobile_money' && (
                    !receptionData.mobileOperator || 
                    !receptionData.mobileNumber
                  ))
                }
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmer la demande
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && (!simulationData.amount || !simulation)) ||
                  (currentStep === 1 && !receptionData.method) ||
                  loading
                }
                className="w-full sm:w-auto"
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Bouton d'historique */}
      {currentStep < 3 && (
        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-gray-500 hover:text-primary"
          >
            <History className="h-4 w-4 mr-2" />
            {showHistory ? 'Masquer l\'historique' : 'Voir l\'historique des échanges'}
          </Button>

          {showHistory && (
            <div className="mt-4">
              <HistoryList onSelectHistory={(item) => {
                setSimulationData({
                  fromCurrency: item.from_currency,
                  toCurrency: item.to_currency,
                  amount: item.amount.toString()
                });
                setShowHistory(false);
              }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}