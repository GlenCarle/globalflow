import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/ui/use-toast';
import ExchangeRequestForm from '../components/currency/ExchangeRequestForm';
import { saveExchangeRequest } from '../services/exchangeService';

const NewExchangeRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Veuillez vous connecter pour effectuer une demande d\'échange.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare the request data
      const requestData = {
        user_id: user.id,
        from_currency: formData.fromCurrency,
        to_currency: formData.toCurrency,
        amount: formData.amount,
        exchange_rate: formData.simulation.exchange_rate,
        fee_amount: formData.simulation.fee_amount,
        fee_percentage: formData.simulation.fee_percentage,
        amount_received: formData.simulation.net_received,
        reception_method: formData.method,
        status: 'pending',
        notes: formData.notes,
        recipient_info: {
          ...(formData.method === 'agency_pickup' && { agency: formData.agency }),
          ...(formData.method === 'bank_transfer' && {
            bank_name: formData.bankName,
            account_holder: formData.accountHolderName,
            iban: formData.iban,
            bic: formData.bic,
          }),
          ...(formData.method === 'mobile_money' && {
            operator: formData.mobileOperator,
            phone_number: formData.mobileNumber,
          }),
        },
      };

      // Save the exchange request
      const response = await saveExchangeRequest(requestData);
      
      // Show success message
      toast({
        title: 'Succès',
        description: 'Votre demande d\'échange a été soumise avec succès.',
      });
      
      // Redirect to the exchange details page
      navigate(`/exchange/${response.id}`);
      
    } catch (error) {
      console.error('Error submitting exchange request:', error);
      
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la soumission de votre demande.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <ExchangeRequestForm 
        onSubmit={handleSubmit} 
        loading={isSubmitting}
      />
    </div>
  );
};

export default NewExchangeRequest;
