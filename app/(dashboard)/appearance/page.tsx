'use client';

import { Card } from '@/components/ui/card';
import { Palette } from 'lucide-react';

export default function AppearancePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Customize your profile, bio, avatar and theme.
        </p>
      </div>

      <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
          <Palette className="h-6 w-6 text-violet-500" />
        </div>
        <h3 className="font-semibold mb-1">Theme editor coming in Session 7</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Profile editing, avatar upload and the full theme customizer will be built in dedicated sessions.
        </p>
      </Card>
    </div>
  );
}
