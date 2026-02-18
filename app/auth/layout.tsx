'use client';

import Link from 'next/link';
import { AuthGuard } from '@/components/auth-guard';
import { Terminal, Code2, Braces } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard guestOnly>
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Form side */}
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 mb-8 group"
            >
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Braces className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                MySandbox<span className="text-primary">.codes</span>
              </span>
            </Link>
            {children}
          </div>
        </div>

        {/* Branding side */}
        <div className="hidden lg:flex flex-col justify-between bg-zinc-950 text-zinc-100 p-12 relative overflow-hidden">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Gradient glow */}
          <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-sm font-mono mb-2">
              <Terminal className="h-4 w-4" />
              <span>~/mysandbox</span>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <blockquote className="space-y-4">
              <p className="text-3xl font-semibold leading-snug tracking-tight">
                Your developer hub.
                <br />
                <span className="text-zinc-400">One link. Every project.</span>
              </p>
              <p className="text-zinc-500 text-lg leading-relaxed max-w-md">
                Custom themes, analytics, and a subdomain that&apos;s all yours.
                Built for devs who ship.
              </p>
            </blockquote>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 pt-4">
              {[
                'Custom Subdomain',
                'Analytics',
                'Dark Themes',
                'Drag & Drop',
                'SEO Ready',
              ].map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-400"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <Code2 className="h-4 w-4 text-zinc-600" />
            <p className="text-xs text-zinc-600 font-mono">
              username.mysandbox.codes
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
