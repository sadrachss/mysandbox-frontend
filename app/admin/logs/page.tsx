'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/admin';
import {
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Link2,
  Settings,
  Key,
  Ban,
  CheckCircle,
  UserPlus,
  Trash2,
} from 'lucide-react';

const ACTION_ICONS: Record<string, any> = {
  'admin.ban_user': Ban,
  'admin.unban_user': CheckCircle,
  'admin.update_user': User,
  'admin.create_user': UserPlus,
  'admin.delete_link': Trash2,
  'admin.change_password': Key,
  'admin.update_config': Settings,
  'admin.change_plan': Shield,
};

const ACTION_COLORS: Record<string, string> = {
  'admin.ban_user': 'text-red-400 bg-red-500/10',
  'admin.unban_user': 'text-emerald-400 bg-emerald-500/10',
  'admin.update_user': 'text-blue-400 bg-blue-500/10',
  'admin.create_user': 'text-cyan-400 bg-cyan-500/10',
  'admin.delete_link': 'text-red-400 bg-red-500/10',
  'admin.change_password': 'text-amber-400 bg-amber-500/10',
  'admin.update_config': 'text-purple-400 bg-purple-500/10',
  'admin.change_plan': 'text-amber-400 bg-amber-500/10',
};

const ACTION_LABELS: Record<string, string> = {
  'admin.ban_user': 'Banned user',
  'admin.unban_user': 'Unbanned user',
  'admin.update_user': 'Updated user',
  'admin.create_user': 'Created user',
  'admin.delete_link': 'Deleted link',
  'admin.change_password': 'Changed password',
  'admin.update_config': 'Updated setting',
  'admin.change_plan': 'Changed plan',
};

function formatDetails(action: string, details: any): string {
  if (!details) return '';

  try {
    const d = typeof details === 'string' ? JSON.parse(details) : details;

    switch (action) {
      case 'admin.ban_user':
      case 'admin.unban_user':
      case 'admin.change_password':
        return d.email ? `User: ${d.email}` : '';

      case 'admin.create_user':
        return d.email ? `Email: ${d.email}` : '';

      case 'admin.update_user': {
        const changes: string[] = [];
        if (d.plan) changes.push(`Plan → ${d.plan}`);
        if (d.email) changes.push(`Email → ${d.email}`);
        if (d.username) changes.push(`Username → ${d.username}`);
        if (d.displayName) changes.push(`Name → ${d.displayName}`);
        if (d.isAdmin === true) changes.push('Promoted to Admin');
        if (d.isAdmin === false) changes.push('Removed Admin');
        if (d.isActive === true) changes.push('Activated');
        if (d.isActive === false) changes.push('Deactivated');
        return changes.join(' · ') || '';
      }

      case 'admin.delete_link':
        return d.title ? `"${d.title}" (${d.url})` : d.url || '';

      case 'admin.update_config': {
        const val = d.value;
        if (val === true || val === 'true') return 'Enabled';
        if (val === false || val === 'false') return 'Disabled';
        if (typeof val === 'number') return `Set to ${val}`;
        if (typeof val === 'string' && val.startsWith('[')) {
          try {
            const list = JSON.parse(val);
            return Array.isArray(list) ? list.join(', ') : val;
          } catch { return val; }
        }
        return String(val);
      }

      default:
        return typeof d === 'object' ? JSON.stringify(d) : String(d);
    }
  } catch {
    return typeof details === 'object' ? JSON.stringify(details) : String(details);
  }
}

export default function AdminLogsPage() {
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'logs', { action: actionFilter, page }],
    queryFn: () => adminService.getLogs({ action: actionFilter !== 'all' ? actionFilter : undefined, page }),
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold">Activity Logs</h1>
    <select
    value={actionFilter}
    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
    className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm"
    >
    <option value="all">All Actions</option>
    <option value="admin.ban">Bans</option>
    <option value="admin.unban">Unbans</option>
    <option value="admin.update_user">User Updates</option>
    <option value="admin.create_user">User Creates</option>
    <option value="admin.change_password">Password Changes</option>
    <option value="admin.delete_link">Link Deletes</option>
    <option value="admin.update_config">Config Changes</option>
    </select>
    </div>

    {/* Log entries */}
    <div className="space-y-2">
    {isLoading ? (
      Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
      ))
    ) : logs.length === 0 ? (
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
      <ScrollText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">No activity logs yet</p>
      </div>
    ) : (
      logs.map((log: any) => {
        const colorClass = ACTION_COLORS[log.action] || 'text-white/50 bg-white/5';
        const Icon = ACTION_ICONS[log.action] || Settings;
        const label = ACTION_LABELS[log.action] || log.action;
        const detailsText = formatDetails(log.action, log.details);

        return (
          <div
          key={log.id}
          className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors"
          >
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">
          {label}
          </span>
          {log.target && log.target !== 'system' && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${colorClass}`}>
            {log.target}
            </span>
          )}
          {log.user && (
            <span className="text-xs text-muted-foreground">
            by <span className="text-white/70">@{log.user.username}</span>
            </span>
          )}
          </div>
          {detailsText && (
            <p className="text-xs text-muted-foreground mt-1">
            {detailsText}
            </p>
          )}
          </div>
          <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground">
          {new Date(log.createdAt).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-[10px] text-muted-foreground/60">
          {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          </div>
          </div>
        );
      })
    )}
    </div>

    {/* Pagination */}
    {pagination && pagination.totalPages > 1 && (
      <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{pagination.total} entries</span>
      <div className="flex items-center gap-2">
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
      className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30">
      <ChevronLeft className="h-4 w-4" />
      </button>
      <span>{page} / {pagination.totalPages}</span>
      <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
      className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30">
      <ChevronRight className="h-4 w-4" />
      </button>
      </div>
      </div>
    )}
    </div>
  );
}
