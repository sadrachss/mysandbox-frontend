'use client';

import Link from 'next/link';
import { Braces, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileNotFoundProps {
  username: string;
}

export function ProfileNotFound({ username }: ProfileNotFoundProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0a0e17]">
      <div className="text-center max-w-md space-y-6">
        {/* Icon */}
        <div className="mx-auto h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Search className="h-7 w-7 text-white/30" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Profile not found</h1>
          <p className="text-sm text-white/50 leading-relaxed">
            The profile <span className="font-mono text-white/70">@{username}</span> doesn&apos;t exist or hasn&apos;t been set up yet.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" size="sm" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Go home
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/auth/register">
              Claim this username
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-4">
          <a
            href="https://mysandbox.codes"
            className="inline-flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            <Braces className="h-3 w-3" />
            <span>MySandbox.codes</span>
          </a>
        </div>
      </div>
    </div>
  );
}
