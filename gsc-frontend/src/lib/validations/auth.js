import { z } from 'zod';

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'L\'email est requis' })
    .email({ message: 'Adresse email invalide' }),
  password: z
    .string()
    .min(1, { message: 'Le mot de passe est requis' }),
});

/**
 * Registration form validation schema
 */
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: 'Le prénom est requis' })
    .max(100, { message: 'Le prénom ne doit pas dépasser 100 caractères' }),
  lastName: z
    .string()
    .min(1, { message: 'Le nom est requis' })
    .max(100, { message: 'Le nom ne doit pas dépasser 100 caractères' }),
  email: z
    .string()
    .min(1, { message: 'L\'email est requis' })
    .email({ message: 'Adresse email invalide' }),
  phone: z
    .string()
    .min(1, { message: 'Le numéro de téléphone est requis' })
    .max(20, { message: 'Le numéro de téléphone ne doit pas dépasser 20 caractères' }),
  password: z
    .string()
    .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    .max(100, { message: 'Le mot de passe ne doit pas dépasser 100 caractères' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'La confirmation du mot de passe est requise' }),
  terms: z
    .boolean()
    .refine(val => val === true, { message: 'Vous devez accepter les conditions d\'utilisation' }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'L\'email est requis' })
    .email({ message: 'Adresse email invalide' }),
});

/**
 * Reset password form validation schema
 */
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    .max(100, { message: 'Le mot de passe ne doit pas dépasser 100 caractères' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'La confirmation du mot de passe est requise' }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * Change password form validation schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { message: 'Le mot de passe actuel est requis' }),
  newPassword: z
    .string()
    .min(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
    .max(100, { message: 'Le nouveau mot de passe ne doit pas dépasser 100 caractères' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'La confirmation du mot de passe est requise' }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * Profile form validation schema
 */
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: 'Le prénom est requis' })
    .max(100, { message: 'Le prénom ne doit pas dépasser 100 caractères' }),
  lastName: z
    .string()
    .min(1, { message: 'Le nom est requis' })
    .max(100, { message: 'Le nom ne doit pas dépasser 100 caractères' }),
  email: z
    .string()
    .min(1, { message: 'L\'email est requis' })
    .email({ message: 'Adresse email invalide' }),
  phone: z
    .string()
    .min(1, { message: 'Le numéro de téléphone est requis' })
    .max(20, { message: 'Le numéro de téléphone ne doit pas dépasser 20 caractères' }),
  address: z
    .string()
    .optional(),
  city: z
    .string()
    .optional(),
  country: z
    .string()
    .optional(),
});