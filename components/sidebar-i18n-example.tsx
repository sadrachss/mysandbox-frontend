'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation, LanguageSwitcher } from '@/lib/i18n';
import {
  LayoutDashboard,
  Link2,
  Palette,
  BarChart3,
  Settings,
  ExternalLink,
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/links', label: t('nav.links'), icon: Link2 },
    { href: '/appearance', label: t('nav.appearance'), icon: Palette },
    { href: '/analytics', label: t('nav.analytics'), icon: BarChart3 },
    { href: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          <span className="text-green-400">&lt;/&gt;</span> MySandbox
          <span className="text-green-400">.codes</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-green-500/10 text-green-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Admin link */}
        {user?.isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname.startsWith('/admin')
                ? 'bg-yellow-500/10 text-yellow-400 font-medium'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-5 h-5" />
            {t('nav.admin')}
          </Link>
        )}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        {/* View profile link */}
        {user?.username && (
          <a
            href={`https://${user.username}.mysandbox.codes`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {t('nav.viewProfile')}
          </a>
        )}

        {/* Language switcher */}
        <LanguageSwitcher compact className="px-3" />

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          {t('auth.logout')}
        </button>
      </div>
    </aside>
  );
}
