'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/admin';
import { toast } from 'sonner';
import {
  Search,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminLinksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'links', { search, page }],
    queryFn: () => adminService.getLinks({ search: search || undefined, page }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'links'] });
      toast.success('Link deleted');
    },
  });

  const links = data?.links || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Links</h1>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search title, URL or username..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03]">
            <tr className="text-left text-muted-foreground text-xs">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-8 bg-white/5 rounded animate-pulse" /></td></tr>
              ))
            ) : links.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No links found</td></tr>
            ) : (
              links.map((link: any) => (
                <tr key={link.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{link.title}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[250px] truncate">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                      {link.url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://${link.user?.username}.mysandbox.codes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-white transition-colors"
                    >
                      @{link.user?.username}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{link._count?.analytics || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      link.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'
                    }`}>
                      {link.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-white/10 text-muted-foreground hover:text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => {
                          if (confirm('Delete this link? This cannot be undone.')) {
                            deleteMutation.mutate(link.id);
                          }
                        }}
                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{pagination.total} links total</span>
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
