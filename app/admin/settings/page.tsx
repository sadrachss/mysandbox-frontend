'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/admin';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Shield,
  UserX,
  Link2,
  Save,
  AlertTriangle,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn: adminService.getConfig,
  });

  const config = data?.config || {};

  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [maxFreeLinks, setMaxFreeLinks] = useState('5');
  const [reservedUsernames, setReservedUsernames] = useState('');

  // Sync state when data loads
  useEffect(() => {
    if (config.registrationEnabled !== undefined) {
      setRegistrationEnabled(config.registrationEnabled === true || config.registrationEnabled === 'true');
    }
    if (config.maxFreeLinks !== undefined) {
      setMaxFreeLinks(String(config.maxFreeLinks));
    }
    if (config.reservedUsernames !== undefined) {
      try {
        const parsed = typeof config.reservedUsernames === 'string'
          ? JSON.parse(config.reservedUsernames)
          : config.reservedUsernames;
        setReservedUsernames(Array.isArray(parsed) ? parsed.join(', ') : String(config.reservedUsernames));
      } catch {
        setReservedUsernames(String(config.reservedUsernames));
      }
    }
  }, [config.registrationEnabled, config.maxFreeLinks, config.reservedUsernames]);

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) => adminService.updateConfig(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'config'] });
      toast.success('Setting saved');
    },
    onError: () => toast.error('Failed to save setting'),
  });

  const saveRegistration = () => {
    updateMutation.mutate({ key: 'registrationEnabled', value: registrationEnabled });
  };

  const saveMaxLinks = () => {
    const num = parseInt(maxFreeLinks);
    if (isNaN(num) || num < 1 || num > 100) {
      toast.error('Must be between 1 and 100');
      return;
    }
    updateMutation.mutate({ key: 'maxFreeLinks', value: num });
  };

  const saveReservedUsernames = () => {
    const list = reservedUsernames.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    updateMutation.mutate({ key: 'reservedUsernames', value: JSON.stringify(list) });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Settings</h1>

      {/* Registration Toggle */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            registrationEnabled ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`}>
            <UserX className={`h-5 w-5 ${registrationEnabled ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">User Registration</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {registrationEnabled ? 'New users can create accounts' : 'Registration is closed — no new signups allowed'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRegistrationEnabled(true)}
            className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
              registrationEnabled ? 'bg-emerald-600 text-white' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setRegistrationEnabled(false)}
            className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
              !registrationEnabled ? 'bg-red-600 text-white' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
            }`}
          >
            Closed
          </button>
          <Button size="sm" onClick={saveRegistration} disabled={updateMutation.isPending} className="bg-white/10 hover:bg-white/15">
            <Save className="h-3.5 w-3.5" />
          </Button>
        </div>

        {!registrationEnabled && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-300">Registration is currently disabled. No one can create new accounts.</p>
          </div>
        )}
      </div>

      {/* Max Free Links */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Link2 className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">Free Plan Link Limit</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Maximum number of links for free users</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={100}
            value={maxFreeLinks}
            onChange={(e) => setMaxFreeLinks(e.target.value)}
            className="w-24 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-center"
          />
          <span className="text-xs text-muted-foreground">links per free user</span>
          <Button size="sm" onClick={saveMaxLinks} disabled={updateMutation.isPending} className="bg-white/10 hover:bg-white/15 ml-auto">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save
          </Button>
        </div>
      </div>

      {/* Reserved Usernames */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">Reserved Usernames</h3>
            <p className="text-xs text-muted-foreground mt-0.5">These usernames cannot be registered by users (comma-separated)</p>
          </div>
        </div>

        <textarea
          value={reservedUsernames}
          onChange={(e) => setReservedUsernames(e.target.value)}
          placeholder="admin, api, cdn, www, mail, app, help, support"
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm resize-none focus:outline-none focus:border-white/20"
        />

        <div className="flex justify-end">
          <Button size="sm" onClick={saveReservedUsernames} disabled={updateMutation.isPending} className="bg-white/10 hover:bg-white/15">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
