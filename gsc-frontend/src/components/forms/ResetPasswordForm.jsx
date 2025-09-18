import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { resetPasswordSchema } from '../../lib/validations/auth';
import api from '../../lib/axios';
import { PUBLIC_ROUTES } from '../../constants/routes';

/**
 * Reset password form component
 * Uses React Hook Form with Zod validation
 */
const ResetPasswordForm = ({ token }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data) => {
    setServerError('');

    try {
      // Make API request to reset password endpoint
      await api.post('/auth/reset-password/', {
        token,
        password: data.password,
      });
      
      // Show success message
      setIsSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate(PUBLIC_ROUTES.LOGIN);
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response?.status === 400) {
        setServerError(error.response.data.message || 'Le lien de réinitialisation est invalide ou a expiré');
      } else {
        setServerError('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <Alert 
          variant="success" 
          title="Mot de passe réinitialisé" 
          description="Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion." 
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive" title="Erreur" description={serverError} />
      )}

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pl-10"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-rose-500">{errors.password.message}</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Le mot de passe doit contenir au moins 8 caractères
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pl-10"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-rose-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;