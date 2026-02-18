'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Menu,
  LogOut,
  Settings,
  ExternalLink,
  LayoutDashboard,
  Link2,
  Palette,
  BarChart3,
  Braces,
  Crown,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.mysandbox.codes';

const mobileNavItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Links', href: '/links', icon: Link2 },
  { label: 'Appearance', href: '/appearance', icon: Palette },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isPro = user?.plan === 'PRO';

  const avatarUrl = user?.profile?.avatarUrl
    ? `${CDN_URL}${user.profile.avatarUrl}`
    : undefined;

  const initials = (user?.profile?.displayName || user?.username || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Determine page title from pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Overview';
    if (pathname.startsWith('/links')) return 'Links';
    if (pathname.startsWith('/appearance')) return 'Appearance';
    if (pathname.startsWith('/analytics')) return 'Analytics';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-card/80 backdrop-blur-sm px-4 lg:px-6">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden mr-2 -ml-1"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>

        {/* Page title */}
        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-base font-semibold tracking-tight">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Profile URL (desktop) */}
          <a
            href={`https://${user?.username}.mysandbox.codes`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono mr-2"
          >
            <span>{user?.username}.mysandbox.codes</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors outline-none">
                <Avatar className="h-7 w-7">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={user?.username} />}
                  <AvatarFallback className="text-[11px] font-medium bg-emerald-500/10 text-emerald-500">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {user?.profile?.displayName || user?.username}
                  </span>
                  <Badge
                    variant={isPro ? 'pro' : 'secondary'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {isPro ? 'PRO' : 'FREE'}
                  </Badge>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.profile?.displayName || user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Overview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`https://${user?.username}.mysandbox.codes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View public page
                </a>
              </DropdownMenuItem>
              {!isPro && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer text-amber-500">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to PRO
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Dashboard navigation menu</SheetDescription>
          </SheetHeader>

          {/* Mobile Logo */}
          <div className="flex items-center h-14 px-4 border-b border-border">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5"
              onClick={() => setMobileOpen(false)}
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Braces className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="font-semibold text-sm tracking-tight">
                MySandbox<span className="text-emerald-500">.codes</span>
              </span>
            </Link>
          </div>

          {/* Mobile nav items */}
          <nav className="flex-1 py-4 px-3 space-y-1">
            {mobileNavItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile profile card */}
          {user && (
            <div className="mt-auto px-3 pb-4 space-y-3">
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
                  className="flex items-center gap-1.5 text-xs text-emerald-500 hover:text-emerald-400 transition-colors font-mono"
                >
                  <span className="truncate">{user.username}.mysandbox.codes</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>

              {!isPro && (
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs font-medium text-amber-500 hover:bg-amber-500/10 transition-colors"
                >
                  <Crown className="h-4 w-4" />
                  <span>Upgrade to PRO</span>
                </Link>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
