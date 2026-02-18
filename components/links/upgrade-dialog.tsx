'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Link2, Palette, BarChart3, Sparkles, ArrowRight } from 'lucide-react';
import NextLink from 'next/link';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const proFeatures = [
  { icon: Link2, label: 'Unlimited links', description: 'No more 5 link limit' },
  { icon: Palette, label: 'Custom themes', description: 'Full visual editor' },
  { icon: BarChart3, label: '365-day analytics', description: 'vs 7 days on Free' },
  { icon: Sparkles, label: 'SEO & scheduling', description: 'Meta tags + timed links' },
];

export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
            <Crown className="h-6 w-6 text-amber-500" />
          </div>
          <DialogTitle className="text-xl">You&apos;ve hit the limit!</DialogTitle>
          <DialogDescription>
            Free plans are limited to 5 links. Upgrade to PRO for unlimited links and much more.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {proFeatures.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <feature.icon className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{feature.label}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center py-1">
          <p className="text-2xl font-bold">
            R$ 9,90<span className="text-sm font-normal text-muted-foreground">/month</span>
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            <NextLink href="/settings">
              Upgrade to PRO
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </NextLink>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
