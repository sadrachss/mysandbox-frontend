'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { authService, type RegisterData, type LoginData } from '@/lib/api/auth';
import { toast } from '@/lib/hooks/use-toast';

export function useAuth() {
  const router = useRouter();
  const { user, isLoading, setUser, logout: clearStore } = useAuthStore();

  const login = useCallback(
    async (data: LoginData) => {
      const response = await authService.login(data);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);
      router.push('/dashboard');
      return response;
    },
    [setUser, router]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const response = await authService.register(data);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);
      router.push('/dashboard');
      return response;
    },
    [setUser, router]
  );

  const logout = useCallback(() => {
    clearStore();
    router.push('/auth/login');
    toast({ title: 'Signed out', description: 'See you soon!' });
  }, [clearStore, router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
