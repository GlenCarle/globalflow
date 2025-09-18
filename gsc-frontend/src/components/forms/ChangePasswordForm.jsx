import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Save } from 'lucide-react';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { changePasswordSchema } from '../../lib/validations/auth';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Change password form component
 * Uses React Hook Form with Zod validation
 */
const ChangePasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const { user } = useAuth();

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data) => {
    setServerError('');
    setFormSuccess('');

    try {
      // Mock API call for password change
      // In a real app, you would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate success
      setFormSuccess('Votre mot de passe a été modifié avec succès');
      
      // Reset form fields
      reset();
    } catch (error) {
      setServerError('Une erreur est survenue. Veuillez réessayer plus tard.');
      console.error('Change password error:', error);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive" title="Erreur" description={serverError} />
      )}
      
      {formSuccess && (
        <Alert variant="success" title="Succès" description={formSuccess} />
      )}

      <div className="space-y-2">
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Mot de passe actuel
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="currentPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pl-10"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
        </div>
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-rose-500">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pl-10"
            error={errors.newPassword?.message}
            {...register('newPassword')}
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
        {errors.newPassword && (
          <p className="mt-1 text-sm text-rose-500">{errors.newPassword.message}</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Le mot de passe doit contenir au moins 8 caractères
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirmer le nouveau mot de passe
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

      <div className="flex justify-end">
        <Button
          type="submit"
          className="gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Modification...' : 'Changer le mot de passe'}
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;