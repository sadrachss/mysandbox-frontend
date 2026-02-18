'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link2, Plus } from 'lucide-react';

export default function LinksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Links</h2>
          <p className="text-sm text-muted-foreground">
            Manage your link hub. Add, edit, reorder and toggle links.
          </p>
        </div>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-1.5" />
          Add link
        </Button>
      </div>

      <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
          <Link2 className="h-6 w-6 text-emerald-500" />
        </div>
        <h3 className="font-semibold mb-1">Link editor coming in Session 3</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          The full CRUD editor with drag & drop reordering, toggle switches and upgrade prompts will be built next.
        </p>
      </Card>
    </div>
  );
}
