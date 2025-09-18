import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { forgotPasswordSchema } from '../../lib/validations/auth';
import api from '../../lib/axios';

/**
 * Forgot password form component
 * Uses React Hook Form with Zod validation
 */
const ForgotPasswordForm = () => {
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data) => {
    setServerError('');
    setIsSuccess(false);

    try {
      // Make API request to forgot password endpoint
      await api.post('/auth/forgot-password/', { email: data.email });
      
      // Show success message
      setIsSuccess(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response?.status === 404) {
        setServerError('Aucun compte n\'est associé à cette adresse email');
      } else {
        setServerError('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <Alert 
          variant="success" 
          title="Email envoyé" 
          description="Un email contenant les instructions pour réinitialiser votre mot de passe a été envoyé à votre adresse email." 
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Si vous ne recevez pas l'email dans les prochaines minutes, vérifiez votre dossier de spam ou contactez notre support.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive" title="Erreur" description={serverError} />
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Adresse email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="nom@exemple.com"
            className="pl-10"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-rose-500">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Envoi en cours...' : 'Réinitialiser le mot de passe'}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;