import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { profileSchema } from '../../lib/validations/auth';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Profile form component
 * Uses React Hook Form with Zod validation
 */
const ProfileForm = () => {
  const { user, updateProfile } = useAuth();
  const [serverError, setServerError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      country: user?.country || '',
    },
  });

  // Form submission handler
  const onSubmit = async (data) => {
    setServerError('');
    setFormSuccess('');

    try {
      const userData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
      };

      const result = await updateProfile(userData);

      if (result.success) {
        setFormSuccess('Votre profil a été mis à jour avec succès');
      } else {
        setServerError(result.error || 'Une erreur est survenue lors de la mise à jour du profil');
      }
    } catch (error) {
      setServerError('Une erreur est survenue. Veuillez réessayer plus tard.');
      console.error('Update profile error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive" title="Erreur" description={serverError} />
      )}
      
      {formSuccess && (
        <Alert variant="success" title="Succès" description={formSuccess} />
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
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Adresse
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="address"
            type="text"
            placeholder="123 Rue Exemple"
            className="pl-10"
            error={errors.address?.message}
            {...register('address')}
          />
        </div>
        {errors.address && (
          <p className="mt-1 text-sm text-rose-500">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ville
          </label>
          <Input
            id="city"
            type="text"
            placeholder="Douala"
            error={errors.city?.message}
            {...register('city')}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-rose-500">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Pays
          </label>
          <Input
            id="country"
            type="text"
            placeholder="Cameroun"
            error={errors.country?.message}
            {...register('country')}
          />
          {errors.country && (
            <p className="mt-1 text-sm text-rose-500">{errors.country.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;