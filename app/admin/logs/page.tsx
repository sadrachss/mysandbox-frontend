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
} from 'lucide-react';

const ACTION_ICONS: Record<string, any> = {
  'admin': Shield,
  'user': User,
  'link': Link2,
  'system': Settings,
};

const ACTION_COLORS: Record<string, string> = {
  'admin.ban_user': 'text-red-400 bg-red-500/10',
  'admin.unban_user': 'text-emerald-400 bg-emerald-500/10',
  'admin.update_user': 'text-blue-400 bg-blue-500/10',
  'admin.create_user': 'text-cyan-400 bg-cyan-500/10',
  'admin.delete_link': 'text-red-400 bg-red-500/10',
  'admin.change_plan': 'text-amber-400 bg-amber-500/10',
  'admin.update_config': 'text-purple-400 bg-purple-500/10',
};

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
            const prefix = log.action?.split('.')[0] || 'system';
            const Icon = ACTION_ICONS[prefix] || Settings;

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
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${colorClass}`}>
                      {log.action}
                    </span>
                    {log.user && (
                      <span className="text-xs text-muted-foreground">
                        by @{log.user.username}
                      </span>
                    )}
                  </div>
                  {log.details && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
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
