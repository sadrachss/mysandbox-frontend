'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  /** If true, redirect authenticated users away (for login/register pages) */
  guestOnly?: boolean;
}

export function AuthGuard({ children, guestOnly = false }: AuthGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (guestOnly && user) {
      router.replace('/dashboard');
      return;
    }

    if (!guestOnly && !user) {
      router.replace('/auth/login');
      return;
    }
  }, [user, isLoading, guestOnly, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Prevent flash: don't render content during redirect
  if (guestOnly && user) return null;
  if (!guestOnly && !user) return null;

  return <>{children}</>;
}
