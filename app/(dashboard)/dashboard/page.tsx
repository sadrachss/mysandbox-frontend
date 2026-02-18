'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Braces } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Temporary top bar - will be replaced by proper navbar in Session 2 */}
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <Braces className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">MySandbox.codes</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user?.username}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
              {user?.plan}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Placeholder content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.profile?.displayName || user?.username}
          </h1>
          <p className="text-muted-foreground">
            Your dashboard is ready. The full layout, link editor, and settings
            will be built in the next sessions.
          </p>
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Your profile URL
            </h2>
            <p className="text-lg font-mono text-primary">
              {user?.username}.mysandbox.codes
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
