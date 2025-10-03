import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { ArrowRight, ArrowLeft, Calculator, Building, CreditCard, Smartphone } from 'lucide-react';
import { simulateExchange, CURRENCIES } from '../../constants/exchangeRates';

const receptionMethods = [
  { value: 'agency_pickup', label: 'Retrait en agence', icon: Building },
  { value: 'bank_transfer', label: 'Virement bancaire', icon: CreditCard },
  { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
];

const ExchangeRequestForm = ({ onSubmit, loading = false, initialData = {} }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [simulation, setSimulation] = useState(null);

  // Step 1: Simulation data
  const [simulationData, setSimulationData] = useState({
    fromCurrency: initialData.fromCurrency || 'XAF',
    toCurrency: initialData.toCurrency || 'USD',
    amount: initialData.amount || ''
  });

  // Step 2: Reception data
  const [receptionData, setReceptionData] = useState({
    method: initialData.method || '',
    agency: initialData.agency || '',
    bankName: initialData.bankName || '',
    accountHolderName: initialData.accountHolderName || '',
    iban: initialData.iban || '',
    bic: initialData.bic || '',
    mobileOperator: initialData.mobileOperator || '',
    mobileNumber: initialData.mobileNumber || ''
  });

  // Step 3: Additional data
  const [additionalData, setAdditionalData] = useState({
    notes: initialData.notes || ''
  });

  // Run simulation when relevant data changes
  useEffect(() => {
    if (simulationData.amount && !isNaN(simulationData.amount) && parseFloat(simulationData.amount) > 0) {
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
    } else {
      setSimulation(null);
    }
  }, [simulationData.fromCurrency, simulationData.toCurrency, simulationData.amount]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSimulationData({ ...simulationData, amount: value });
    }
  };

  const swapCurrencies = () => {
    const newFromCurrency = simulationData.toCurrency;
    const newToCurrency = simulationData.fromCurrency;
    const newAmount = simulation?.converted_amount 
      ? parseFloat(simulation.converted_amount).toFixed(2)
      : simulationData.amount;

    setSimulationData({
      ...simulationData,
      fromCurrency: newFromCurrency,
      toCurrency: newToCurrency,
      amount: newAmount
    });
  };

  const handleReceptionMethodChange = (value) => {
    setReceptionData({
      ...receptionData,
      method: value,
      // Reset other fields when method changes
      agency: '',
      bankName: '',
      accountHolderName: '',
      iban: '',
      bic: '',
      mobileOperator: '',
      mobileNumber: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentStep === 0 && !simulation) {
      alert('Veuillez effectuer une simulation valide avant de continuer');
      return;
    }

    if (currentStep === 1 && !receptionData.method) {
      alert('Veuillez sélectionner un mode de réception');
      return;
    }

    // Validate reception method specific fields
    if (currentStep === 1) {
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
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit the form
      const formData = {
        ...simulationData,
        ...receptionData,
        ...additionalData,
        simulation: simulation
      };
      
      if (onSubmit) {
        onSubmit(formData);
      }
    }
  };

  const renderStepOne = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">Je donne</label>
          <Select 
            value={simulationData.fromCurrency}
            onValueChange={(value) => setSimulationData({...simulationData, fromCurrency: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une devise" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center">
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={swapCurrencies}
            className="rounded-full"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Je reçois</label>
          <Select 
            value={simulationData.toCurrency}
            onValueChange={(value) => setSimulationData({...simulationData, toCurrency: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une devise" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Montant à échanger</label>
        <Input
          type="text"
          value={simulationData.amount}
          onChange={handleAmountChange}
          placeholder="Entrez le montant"
          className="text-lg font-medium"
        />
      </div>

      {simulation && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Taux de change</p>
                <p className="font-medium">1 {simulation.from_currency} = {simulation.rate} {simulation.to_currency}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Frais</p>
                <p className="font-medium">{simulation.fee_amount.toFixed(2)} {simulation.to_currency} ({simulation.fee_percentage}%)</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vous recevrez</p>
                <p className="text-2xl font-bold text-primary">
                  {simulation.net_received.toFixed(2)} {simulation.to_currency}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Mode de réception</label>
        <Select 
          value={receptionData.method}
          onValueChange={handleReceptionMethodChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un mode de réception" />
          </SelectTrigger>
          <SelectContent>
            {receptionMethods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                <div className="flex items-center gap-2">
                  <method.icon className="h-4 w-4" />
                  {method.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {receptionData.method === 'agency_pickup' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Agence de retrait</label>
          <Input
            type="text"
            value={receptionData.agency}
            onChange={(e) => setReceptionData({...receptionData, agency: e.target.value})}
            placeholder="Sélectionnez une agence"
          />
        </div>
      )}

      {receptionData.method === 'bank_transfer' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom de la banque</label>
            <Input
              value={receptionData.bankName}
              onChange={(e) => setReceptionData({...receptionData, bankName: e.target.value})}
              placeholder="Nom de votre banque"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Titulaire du compte</label>
            <Input
              value={receptionData.accountHolderName}
              onChange={(e) => setReceptionData({...receptionData, accountHolderName: e.target.value})}
              placeholder="Nom du titulaire du compte"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">IBAN</label>
              <Input
                value={receptionData.iban}
                onChange={(e) => setReceptionData({...receptionData, iban: e.target.value})}
                placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">BIC/SWIFT</label>
              <Input
                value={receptionData.bic}
                onChange={(e) => setReceptionData({...receptionData, bic: e.target.value})}
                placeholder="XXXXXXXXXXX"
              />
            </div>
          </div>
        </div>
      )}

      {receptionData.method === 'mobile_money' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Opérateur mobile</label>
            <Select 
              value={receptionData.mobileOperator}
              onValueChange={(value) => setReceptionData({...receptionData, mobileOperator: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un opérateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                <SelectItem value="orange">Orange Money</SelectItem>
                <SelectItem value="moov">Moov Money</SelectItem>
                <SelectItem value="wave">Wave Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Numéro de téléphone</label>
            <Input
              type="tel"
              value={receptionData.mobileNumber}
              onChange={(e) => setReceptionData({...receptionData, mobileNumber: e.target.value})}
              placeholder="6XX XXX XXX"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif de votre demande</CardTitle>
          <CardDescription>Veuillez vérifier les informations avant de soumettre votre demande</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Détails de l'échange</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Montant à échanger</p>
                <p className="font-medium">{simulation.amount_sent} {simulation.from_currency}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Taux de change</p>
                <p className="font-medium">1 {simulation.from_currency} = {simulation.rate} {simulation.to_currency}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Frais</p>
                <p className="font-medium">{simulation.fee_amount.toFixed(2)} {simulation.to_currency} ({simulation.fee_percentage}%)</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Montant à recevoir</p>
                <p className="text-lg font-bold text-primary">{simulation.net_received.toFixed(2)} {simulation.to_currency}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Mode de réception</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Méthode</p>
                <p className="font-medium">
                  {receptionMethods.find(m => m.value === receptionData.method)?.label || 'Non spécifié'}
                </p>
              </div>
              
              {receptionData.method === 'agency_pickup' && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Agence</p>
                  <p className="font-medium">{receptionData.agency || 'Non spécifié'}</p>
                </div>
              )}

              {receptionData.method === 'bank_transfer' && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Banque</p>
                    <p className="font-medium">{receptionData.bankName || 'Non spécifié'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Titulaire</p>
                    <p className="font-medium">{receptionData.accountHolderName || 'Non spécifié'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">IBAN</p>
                    <p className="font-mono text-sm">{receptionData.iban || 'Non spécifié'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">BIC/SWIFT</p>
                    <p className="font-mono text-sm">{receptionData.bic || 'Non spécifié'}</p>
                  </div>
                </>
              )}

              {receptionData.method === 'mobile_money' && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Opérateur</p>
                    <p className="font-medium">
                      {receptionData.mobileOperator === 'mtn' ? 'MTN Mobile Money' : 
                       receptionData.mobileOperator === 'orange' ? 'Orange Money' :
                       receptionData.mobileOperator === 'moov' ? 'Moov Money' :
                       receptionData.mobileOperator === 'wave' ? 'Wave Mobile Money' : 'Non spécifié'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Numéro</p>
                    <p className="font-medium">{receptionData.mobileNumber || 'Non spécifié'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes supplémentaires (optionnel)</label>
            <Textarea
              value={additionalData.notes}
              onChange={(e) => setAdditionalData({...additionalData, notes: e.target.value})}
              placeholder="Ajoutez des instructions ou des détails supplémentaires..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const steps = [
    { title: 'Simulation', description: 'Configurez votre échange' },
    { title: 'Réception', description: 'Comment souhaitez-vous recevoir vos fonds ?' },
    { title: 'Confirmation', description: 'Vérifiez les détails' },
  ];

  const currentStepConfig = steps[currentStep];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Nouvelle demande d'échange</h2>
        <p className="text-muted-foreground">
          {currentStepConfig.description}
        </p>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-muted" aria-hidden="true">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
        <ul className="relative flex justify-between">
          {steps.map((step, index) => (
            <li key={index} className="flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                index <= currentStep 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : 'border-muted-foreground/20 bg-background text-muted-foreground'
              }`}>
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <span className={`text-xs font-medium ${
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 0 && renderStepOne()}
        {currentStep === 1 && renderStepTwo()}
        {currentStep === 2 && renderStepThree()}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate(-1)}
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 0 ? 'Annuler' : 'Précédent'}
          </Button>
          
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : currentStep < 2 ? (
              <>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              'Soumettre la demande'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExchangeRequestForm;
