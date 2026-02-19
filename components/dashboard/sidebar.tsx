'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Link2,
  Palette,
  BarChart3,
  Settings,
  ExternalLink,
  Braces,
  Crown,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.mysandbox.codes';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Links',
    href: '/links',
    icon: Link2,
  },
  {
    label: 'Appearance',
    href: '/appearance',
    icon: Palette,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isPro = user?.plan === 'PRO';

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-card border-r border-border sticky top-0 transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Braces className="h-4 w-4 text-emerald-500" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm tracking-tight truncate">
              MySandbox<span className="text-emerald-500">.codes</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-4.5 w-4.5 shrink-0', isActive && 'text-emerald-500')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md text-xs font-medium text-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md">
                  {item.label}
                </div>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile URL Card */}
      {!collapsed && user && (
        <div className="px-3 pb-3">
          <div className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Your page
              </span>
              <Badge variant={isPro ? 'pro' : 'secondary'} className="text-[10px] px-1.5 py-0">
                {isPro ? 'PRO' : 'FREE'}
              </Badge>
            </div>
            <a
              href={`https://${user.username}.mysandbox.codes`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-emerald-500 hover:text-emerald-400 transition-colors font-mono truncate"
            >
              <span className="truncate">{user.username}.mysandbox.codes</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        </div>
      )}

      {/* PRO Upgrade CTA */}
      {!collapsed && !isPro && (
        <div className="px-3 pb-3">
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs font-medium text-amber-500 hover:bg-amber-500/10 transition-colors"
          >
            <Crown className="h-4 w-4 shrink-0" />
            <span>Upgrade to PRO</span>
          </Link>
        </div>
      )}

      {/* Admin Panel Link */}
      {!collapsed && user?.isAdmin && (
        <div className="px-3 pb-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span>Admin Panel</span>
          </Link>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="border-t border-border p-2">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full rounded-md py-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
