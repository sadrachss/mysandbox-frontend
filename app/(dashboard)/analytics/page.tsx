'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Lock } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

export default function AnalyticsPage() {
  const user = useAuthStore((s) => s.user);
  const isPro = user?.plan === 'PRO';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Track clicks, devices, locations and referrers.
          </p>
        </div>
        {!isPro && (
          <Badge variant="pro" className="shrink-0">
            <Lock className="h-3 w-3 mr-1" />
            Full stats PRO only
          </Badge>
        )}
      </div>

      <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
          <BarChart3 className="h-6 w-6 text-blue-500" />
        </div>
        <h3 className="font-semibold mb-1">Analytics dashboard coming in Session 8</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Charts, click maps, device breakdown and referrer tracking will be built here.
          {!isPro && ' Free users get 7-day retention; PRO users get 365 days.'}
        </p>
      </Card>
    </div>
  );
}
