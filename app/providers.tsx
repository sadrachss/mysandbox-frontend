'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { authService } from '@/lib/api/auth';
import { I18nProvider } from '@/lib/i18n';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      return;
    }

    authService
      .me()
      .then((data) => setUser(data.user))
      .catch(() => logout());
  }, [setUser, logout]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider defaultLocale="pt-BR">
        <AuthInitializer>{children}</AuthInitializer>
      </I18nProvider>
    </QueryClientProvider>
  );
}
