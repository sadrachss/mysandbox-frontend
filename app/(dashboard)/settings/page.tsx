'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Crown, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isPro = user?.plan === 'PRO';

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account, subscription and preferences.
        </p>
      </div>

      {/* Plan info card */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Current Plan</h3>
              <Badge variant={isPro ? 'pro' : 'secondary'}>
                {isPro ? 'PRO' : 'FREE'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isPro
                ? 'You have access to all features'
                : 'Upgrade for unlimited links, themes and analytics'}
            </p>
          </div>
          {!isPro && (
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              <Crown className="h-3.5 w-3.5 mr-1.5" />
              Upgrade
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          )}
        </div>
      </Card>

      <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
          <Settings className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">Full settings coming in Session 6</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Account settings, Stripe subscription management, language preferences and danger zone will be built here.
        </p>
      </Card>
    </div>
  );
}
