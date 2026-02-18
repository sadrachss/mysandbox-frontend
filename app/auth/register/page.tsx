'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Eye, EyeOff, Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from '@/lib/hooks/use-toast';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
      displayName: '',
    },
  });

  const watchedUsername = watch('username');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast({
        title: 'Account created!',
        description: 'Welcome to MySandbox.codes',
        variant: 'success',
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.error || 'Something went wrong. Try again.';
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Create your hub</h1>
        <p className="text-sm text-muted-foreground">
          Set up your developer link hub in seconds
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            placeholder="John Doe"
            autoComplete="name"
            disabled={isSubmitting}
            {...register('displayName')}
          />
          {errors.displayName && (
            <p className="text-xs text-destructive">
              {errors.displayName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="johndoe"
            autoComplete="username"
            disabled={isSubmitting}
            {...register('username', {
              onChange: (e) => {
                e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
              },
            })}
          />
          {/* Subdomain preview */}
          {watchedUsername && watchedUsername.length >= 3 && !errors.username && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Globe className="h-3 w-3" />
              <span className="font-mono">
                {watchedUsername.toLowerCase()}.mysandbox.codes
              </span>
            </div>
          )}
          {errors.username && (
            <p className="text-xs text-destructive">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isSubmitting}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              autoComplete="new-password"
              disabled={isSubmitting}
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
