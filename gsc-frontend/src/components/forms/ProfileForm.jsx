import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, MapPin, Save, Edit, Camera, X } from 'lucide-react';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { profileSchema } from '../../lib/validations/auth';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/axios';

/**
 * Profile form component
 * Uses React Hook Form with Zod validation
 */
const ProfileForm = () => {
  const { user, updateProfile, setUser } = useAuth();
  const [serverError, setServerError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profile_picture_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/users/me/');
        console.log('User profile data:', response.data);
        // Update profile picture URL if available
        if (response.data.profile_picture_url) {
          setProfilePictureUrl(response.data.profile_picture_url);
        }
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Initialize React Hook Form with Zod validation
  const {
    register,
    reset,
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
      bio: user?.bio || '',
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    console.log('User data:', user);
    if (user) {
      reset({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        bio: user.bio || '',
      });
    }
  }, [user, reset]);

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setServerError('');
    setFormSuccess('');
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePictureUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async () => {
    if (!profilePicture) return;

    setIsUploading(true);
    setServerError('');
    
    try {
      const formData = new FormData();
      formData.append('profile_picture', profilePicture);
      
      const response = await api.post('/users/profile-picture/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProfilePictureUrl(response.data.profile_picture_url);
      setFormSuccess('Photo de profil mise à jour avec succès');
      setProfilePicture(null);
    } catch (error) {
      setServerError('Erreur lors de l\'upload de la photo de profil');
      console.error('Profile picture upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove profile picture
  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePictureUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        bio: data.bio,
      };

      const result = await updateProfile(userData);

      if (result.success) {
        setFormSuccess('Votre profil a été mis à jour avec succès');
        setIsEditing(false);
        
        // Upload profile picture if selected
        if (profilePicture) {
          await uploadProfilePicture();
        }
      } else {
        setServerError(result.error || 'Une erreur est survenue lors de la mise à jour du profil');
      }
    } catch (error) {
      setServerError('Une erreur est survenue. Veuillez réessayer plus tard.');
      console.error('Update profile error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {serverError && (
        <Alert variant="destructive" title="Erreur" description={serverError} />
      )}
      
      {formSuccess && (
        <Alert variant="success" title="Succès" description={formSuccess} />
      )}

      {/* Photo de profil */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl.startsWith('http')
                  ? profilePictureUrl
                  : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${profilePictureUrl.startsWith('/') ? '' : '/'}${profilePictureUrl}`}
                alt="Photo de profil"
                className="h-full w-full object-cover"
                onError={(e) => {
                  console.error('Error loading profile picture:', e);
                  // Ne pas définir src à une chaîne vide, laisser React gérer l'affichage de l'icône User
                  e.target.onerror = null;
                  setProfilePictureUrl(null);
                }}
              />
            ) : (
              <User className="h-16 w-16 text-gray-400" />
            )}
          </div>
          
          {isEditing && (
            <div className="absolute bottom-0 right-0 flex space-x-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 transition-colors"
                title="Changer la photo"
              >
                <Camera className="h-4 w-4" />
              </button>
              
              {profilePictureUrl && (
                <button
                  type="button"
                  onClick={removeProfilePicture}
                  className="p-2 bg-rose-500 text-white rounded-full shadow-md hover:bg-rose-600 transition-colors"
                  title="Supprimer la photo"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleProfilePictureChange}
          accept="image/*"
          className="hidden"
        />
        
        {profilePicture && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {profilePicture.name}
          </p>
        )}
      </div>

      {/* Bouton d'édition */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant={isEditing ? "outline" : "default"}
          className="gap-2"
          onClick={toggleEditMode}
        >
          {isEditing ? 'Annuler' : 'Modifier le profil'}
          {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                className="pl-10"
                error={errors.firstName?.message}
                disabled={!isEditing}
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
                className="pl-10"
                error={errors.lastName?.message}
                disabled={!isEditing}
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
              className="pl-10"
              error={errors.email?.message}
              disabled={!isEditing}
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
              className="pl-10"
              error={errors.phone?.message}
              disabled={!isEditing}
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
              className="pl-10"
              error={errors.address?.message}
              disabled={!isEditing}
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
              error={errors.city?.message}
              disabled={!isEditing}
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
              error={errors.country?.message}
              disabled={!isEditing}
              {...register('country')}
            />
            {errors.country && (
              <p className="mt-1 text-sm text-rose-500">{errors.country.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Biographie
          </label>
          <textarea
            id="bio"
            className={`w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 ${errors.bio ? 'border-rose-500' : ''}`}
            rows={4}
            disabled={!isEditing}
            {...register('bio')}
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-rose-500">{errors.bio.message}</p>
          )}
        </div>

        {isEditing && (
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
        )}
      </form>
    </div>
  );
};

export default ProfileForm;