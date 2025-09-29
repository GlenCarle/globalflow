import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { loginSchema } from '../../lib/validations/auth';
import { useAuth } from '../../contexts/AuthContext';
import { CLIENT_ROUTES, PUBLIC_ROUTES } from '../../constants/routes';
import NotificationToast from '../NotificationToast';

/**
 * Login form component
 * Uses React Hook Form with Zod validation
 */
const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from location state or default to dashboard
  const from = location.state?.from || CLIENT_ROUTES.DASHBOARD;

  // Show error toast
  const showErrorToast = (message) => {
    setToast({ message, type: 'error', visible: true });
  };

  // Hide toast
  const hideToast = () => {
    setToast({ message: '', type: '', visible: false });
  };

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data, e) => {
    // Prevent default form submission behavior (page reload)
    if (e) {
      e.preventDefault();
    }

    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        // Hide any existing toast
        hideToast();
        // Redirect to the page the user was trying to access or dashboard
        navigate(from, { replace: true });
      } else {
        showErrorToast(result.error || 'Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (error) {
      showErrorToast('Une erreur est survenue. Veuillez réessayer plus tard.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="relative">
      {toast.visible && (
        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md">
          <NotificationToast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        </div>
      )}
      <form className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
            <LogIn className="h-7 w-7 text-primary" />
          </span>
          <h2 className="text-2xl font-bold text-primary">Connexion à votre espace</h2>
        </div>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Email</label>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <Input type="email" {...register('email')} placeholder="Votre email" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800" />
          </div>
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Mot de passe</label>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <Input type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Votre mot de passe" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800" />
            <button type="button" onClick={() => setShowPassword(v => !v)} className="ml-2 text-primary">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <Button type="submit" className="w-full md:w-auto flex items-center gap-2 animate-bounce-on-hover" disabled={isSubmitting}>
          Se connecter
          <LogIn className="h-4 w-4" />
        </Button>
      </div>
    </form>
    </div>
  );
};

export default LoginForm;