'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/admin';
import {
  Users,
  Crown,
  Link2,
  MousePointerClick,
  TrendingUp,
  UserPlus,
  DollarSign,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: adminService.getOverview,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const charts = data?.charts;
  const recentUsers = data?.recentUsers;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'PRO Users', value: stats?.proUsers || 0, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Total Links', value: stats?.totalLinks || 0, icon: Link2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Clicks', value: stats?.totalClicks || 0, icon: MousePointerClick, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'New This Month', value: stats?.newUsersThisMonth || 0, icon: UserPlus, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Clicks This Month', value: stats?.clicksThisMonth || 0, icon: TrendingUp, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'MRR', value: `R$ ${stats?.mrr || '0.00'}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Free Users', value: stats?.freeUsers || 0, icon: Users, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  ];

  // Simple bar chart renderer
  const maxSignups = Math.max(...(charts?.signupsByDay?.map((d: any) => d.count) || [1]));
  const maxClicks = Math.max(...(charts?.clicksByDay?.map((d: any) => d.count) || [1]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <span className="text-xs text-muted-foreground font-mono">
          {new Date().toLocaleDateString('pt-BR')}
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <div className={`h-8 w-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Signups Chart */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h3 className="text-sm font-medium mb-4">New Signups (30 days)</h3>
          <div className="flex items-end gap-1 h-32">
            {(charts?.signupsByDay || []).map((d: any, i: number) => (
              <div
                key={i}
                className="flex-1 bg-blue-500/60 rounded-t hover:bg-blue-500 transition-colors cursor-default group relative"
                style={{ height: `${Math.max((d.count / maxSignups) * 100, 4)}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-white/10 backdrop-blur text-xs px-2 py-0.5 rounded whitespace-nowrap">
                  {d.count} - {new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
          {(!charts?.signupsByDay || charts.signupsByDay.length === 0) && (
            <p className="text-xs text-muted-foreground text-center py-8">No data yet</p>
          )}
        </div>

        {/* Clicks Chart */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <h3 className="text-sm font-medium mb-4">Clicks (30 days)</h3>
          <div className="flex items-end gap-1 h-32">
            {(charts?.clicksByDay || []).map((d: any, i: number) => (
              <div
                key={i}
                className="flex-1 bg-emerald-500/60 rounded-t hover:bg-emerald-500 transition-colors cursor-default group relative"
                style={{ height: `${Math.max((d.count / maxClicks) * 100, 4)}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-white/10 backdrop-blur text-xs px-2 py-0.5 rounded whitespace-nowrap">
                  {d.count} - {new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
          {(!charts?.clicksByDay || charts.clicksByDay.length === 0) && (
            <p className="text-xs text-muted-foreground text-center py-8">No data yet</p>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h3 className="text-sm font-medium mb-4">Recent Signups</h3>
        <div className="space-y-2">
          {(recentUsers || []).map((user: any) => (
            <div
              key={user.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                  {user.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  user.plan === 'PRO' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-white/40'
                }`}>
                  {user.plan}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
