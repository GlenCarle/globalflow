import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { registerSchema } from '../../lib/validations/auth';
import { useAuth } from '../../contexts/AuthContext';
import { CLIENT_ROUTES } from '../../constants/routes';

/**
 * Registration form component
 * Uses React Hook Form with Zod validation
 */
const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  // Form submission handler
  const onSubmit = async (data) => {
    setServerError('');

    try {
      const userData = {
        username: data.email, // Utiliser l'email comme nom d'utilisateur
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
      };

      const result = await registerUser(userData);

      if (result.success) {
        // Rediriger vers le tableau de bord après inscription réussie
        navigate(CLIENT_ROUTES.DASHBOARD);
      } else {
        setServerError(result.error || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(error.response?.data?.username?.[0] || 
                    error.response?.data?.email?.[0] || 
                    'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Prénom
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="firstName"
              type="text"
              placeholder="Jean"
              className="pl-10"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-sm text-rose-500">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nom
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="lastName"
              type="text"
              placeholder="Dupont"
              className="pl-10"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-sm text-rose-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

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

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Téléphone
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="+237 123 456 789"
            className="pl-10"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-rose-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Mot de passe
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

      <div className="flex items-center">
        <input
          id="terms"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          {...register('terms')}
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
          J'accepte les{' '}
          <Link to="/terms" className="text-primary hover:underline">
            conditions d'utilisation
          </Link>{' '}
          et la{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            politique de confidentialité
          </Link>
        </label>
      </div>
      {errors.terms && (
        <p className="mt-1 text-sm text-rose-500">{errors.terms.message}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Inscription en cours...' : 'Créer un compte'}
      </Button>
    </form>
  );
};

export default RegisterForm;