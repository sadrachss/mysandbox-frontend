'use client';

import { useToast } from '@/lib/hooks/use-toast';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'relative rounded-lg border px-4 py-3 pr-10 shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in-0 duration-200',
            t.variant === 'destructive' &&
              'border-red-500/30 bg-red-950/90 text-red-100',
            t.variant === 'success' &&
              'border-emerald-500/30 bg-emerald-950/90 text-emerald-100',
            (!t.variant || t.variant === 'default') &&
              'border-border bg-card/95 text-card-foreground'
          )}
        >
          {t.title && (
            <p className="text-sm font-semibold leading-none tracking-tight">
              {t.title}
            </p>
          )}
          {t.description && (
            <p className={cn('text-sm opacity-80', t.title && 'mt-1')}>
              {t.description}
            </p>
          )}
          <button
            onClick={() => dismiss(t.id)}
            className="absolute right-2 top-2 rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
