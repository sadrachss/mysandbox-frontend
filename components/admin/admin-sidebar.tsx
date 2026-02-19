'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Link2,
  BarChart3,
  ScrollText,
  Settings,
  ChevronLeft,
  Shield,
  ArrowLeft,
} from 'lucide-react';

const adminNav = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Links', href: '/admin/links', icon: Link2 },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Logs', href: '/admin/logs', icon: ScrollText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-white/5 bg-[#0a0e17] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            <span className="text-sm font-bold text-white">Admin Panel</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {adminNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 h-9 px-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-red-500/10 text-red-400'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Back to Dashboard */}
      <div className="p-2 border-t border-white/5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 h-9 px-2.5 rounded-md text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Back to Dashboard</span>}
        </Link>
      </div>
    </aside>
  );
}
