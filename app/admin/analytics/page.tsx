'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/admin';
import { Globe, Smartphone, Monitor, Chrome } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', days],
    queryFn: () => adminService.getAnalytics(days),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Global Analytics</h1>
        <div className="grid lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Global Analytics</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* By Country */}
        <BarChartCard
          title="Top Countries"
          icon={<Globe className="h-4 w-4 text-blue-400" />}
          data={data?.byCountry || []}
          color="bg-blue-500"
        />

        {/* By Device */}
        <PieChartCard
          title="Devices"
          icon={<Smartphone className="h-4 w-4 text-emerald-400" />}
          data={data?.byDevice || []}
          colors={['bg-emerald-500', 'bg-blue-500', 'bg-purple-500']}
        />

        {/* By Browser */}
        <BarChartCard
          title="Browsers"
          icon={<Chrome className="h-4 w-4 text-amber-400" />}
          data={data?.byBrowser || []}
          color="bg-amber-500"
        />

        {/* By OS */}
        <PieChartCard
          title="Operating Systems"
          icon={<Monitor className="h-4 w-4 text-pink-400" />}
          data={data?.byOS || []}
          colors={['bg-pink-500', 'bg-cyan-500', 'bg-orange-500', 'bg-violet-500', 'bg-lime-500']}
        />

        {/* Top Referrers */}
        <BarChartCard
          title="Top Referrers"
          icon={<Globe className="h-4 w-4 text-cyan-400" />}
          data={data?.topReferrers || []}
          color="bg-cyan-500"
        />
      </div>
    </div>
  );
}

// Horizontal bar chart component
function BarChartCard({ title, icon, data, color }: { title: string; icon: React.ReactNode; data: { name: string; count: number }[]; color: string }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-medium">{title}</h3>
      </div>

      {data.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-8">No data yet</p>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 10).map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-28 truncate" title={item.name || 'Unknown'}>
                {item.name || 'Unknown'}
              </span>
              <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                <div
                  className={`h-full ${color}/60 rounded`}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground w-10 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple pie/donut chart component
function PieChartCard({ title, icon, data, colors }: { title: string; icon: React.ReactNode; data: { name: string; count: number }[]; colors: string[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-medium">{title}</h3>
      </div>

      {data.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-8">No data yet</p>
      ) : (
        <div className="space-y-3">
          {/* Stacked bar as simple visualization */}
          <div className="flex h-8 rounded-lg overflow-hidden">
            {data.map((item, i) => (
              <div
                key={i}
                className={`${colors[i % colors.length]}/70 transition-all`}
                style={{ width: `${(item.count / total) * 100}%` }}
                title={`${item.name}: ${item.count}`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {data.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-sm ${colors[i % colors.length]}/70`} />
                <span className="text-xs text-muted-foreground">
                  {item.name || 'Unknown'} ({Math.round((item.count / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
