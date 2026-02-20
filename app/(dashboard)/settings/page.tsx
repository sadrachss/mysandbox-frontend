'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { profileService } from '@/lib/api/profile';
import { useAuthStore } from '@/lib/store/auth';
import { toast } from '@/lib/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Crown,
  ArrowRight,
  Key,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isPro = user?.plan === 'PRO';

  return (
    <div className="space-y-6">
    <div className="space-y-1">
    <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
    <p className="text-sm text-muted-foreground">
    Manage your account, subscription and preferences.
    </p>
    </div>

    {/* Plan info card */}
    <Card className="p-5">
    <div className="flex items-center justify-between">
    <div className="space-y-1">
    <div className="flex items-center gap-2">
    <h3 className="font-semibold text-sm">Current Plan</h3>
    <Badge variant={isPro ? 'pro' : 'secondary'}>
    {isPro ? 'PRO' : 'FREE'}
    </Badge>
    </div>
    <p className="text-xs text-muted-foreground">
    {isPro
      ? 'You have access to all features'
  : 'Upgrade for unlimited links, themes and analytics'}
  </p>
  </div>
  {!isPro && (
    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
    <Crown className="h-3.5 w-3.5 mr-1.5" />
    Upgrade
    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
    </Button>
  )}
  </div>
  </Card>

  {/* Account Info */}
  <Card className="p-5 space-y-3">
  <h3 className="font-semibold text-sm flex items-center gap-2">
  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
  Account Info
  </h3>
  <div className="grid gap-2 text-sm">
  <div className="flex items-center justify-between py-2 border-b border-border/50">
  <span className="text-muted-foreground">Email</span>
  <span className="font-medium">{user?.email}</span>
  </div>
  <div className="flex items-center justify-between py-2 border-b border-border/50">
  <span className="text-muted-foreground">Username</span>
  <span className="font-medium">@{user?.username}</span>
  </div>
  <div className="flex items-center justify-between py-2">
  <span className="text-muted-foreground">Member since</span>
  <span className="font-medium">
  {user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR')
    : '—'}
    </span>
    </div>
    </div>
    </Card>

    {/* Change Password */}
    <ChangePasswordSection />

    {/* Danger Zone */}
    <DangerZone onLogout={logout} />
    </div>
  );
}

// ============================================
// CHANGE PASSWORD SECTION
// ============================================
function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const logout = useAuthStore((s) => s.logout);

  const mutation = useMutation({
    mutationFn: () => profileService.changePassword(currentPassword, newPassword),
                               onSuccess: () => {
                                 toast({ title: 'Password changed', description: 'You will be logged out. Please login with your new password.' });
                                 setCurrentPassword('');
                                 setNewPassword('');
                                 setConfirmPassword('');
                                 // Logout after 2 seconds (tokenVersion was incremented)
                                 setTimeout(() => logout(), 2000);
                               },
                               onError: (error: any) => {
                                 toast({
                                   title: 'Error',
                                   description: error.response?.data?.error || 'Failed to change password',
                                   variant: 'destructive',
                                 });
                               },
  });

  const handleSubmit = () => {
    if (!currentPassword) {
      toast({ title: 'Error', description: 'Enter your current password', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Error', description: 'New password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    mutation.mutate();
  };

  return (
    <Card className="p-5 space-y-4">
    <h3 className="font-semibold text-sm flex items-center gap-2">
    <Key className="h-4 w-4 text-muted-foreground" />
    Change Password
    </h3>

    <div className="space-y-3 max-w-md">
    <div>
    <label className="text-xs text-muted-foreground">Current Password</label>
    <div className="relative mt-1">
    <input
    type={showCurrent ? 'text' : 'password'}
    value={currentPassword}
    onChange={(e) => setCurrentPassword(e.target.value)}
    className="w-full h-9 px-3 pr-9 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    placeholder="Enter current password"
    />
    <button
    type="button"
    onClick={() => setShowCurrent(!showCurrent)}
    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
    {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
    </button>
    </div>
    </div>

    <div>
    <label className="text-xs text-muted-foreground">New Password</label>
    <div className="relative mt-1">
    <input
    type={showNew ? 'text' : 'password'}
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    className="w-full h-9 px-3 pr-9 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    placeholder="Min 8 characters"
    />
    <button
    type="button"
    onClick={() => setShowNew(!showNew)}
    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
    {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
    </button>
    </div>
    </div>

    <div>
    <label className="text-xs text-muted-foreground">Confirm New Password</label>
    <input
    type="password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    className="w-full h-9 px-3 rounded-lg bg-background border border-border text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
    placeholder="Repeat new password"
    />
    </div>

    <Button
    size="sm"
    onClick={handleSubmit}
    disabled={mutation.isPending || !currentPassword || !newPassword || !confirmPassword}
    className="bg-emerald-600 hover:bg-emerald-700 text-white"
    >
    <Key className="h-3.5 w-3.5 mr-1.5" />
    {mutation.isPending ? 'Changing...' : 'Change Password'}
    </Button>
    </div>
    </Card>
  );
}

// ============================================
// DANGER ZONE
// ============================================
function DangerZone({ onLogout }: { onLogout: () => void }) {
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const mutation = useMutation({
    mutationFn: () => profileService.deleteAccount(password, confirmation),
                               onSuccess: () => {
                                 toast({ title: 'Account deleted', description: 'Your account has been permanently deleted.' });
                                 setTimeout(() => onLogout(), 1500);
                               },
                               onError: (error: any) => {
                                 toast({
                                   title: 'Error',
                                   description: error.response?.data?.error || 'Failed to delete account',
                                   variant: 'destructive',
                                 });
                               },
  });

  return (
    <Card className="p-5 space-y-4 border-red-500/20">
    <h3 className="font-semibold text-sm flex items-center gap-2 text-red-500">
    <AlertTriangle className="h-4 w-4" />
    Danger Zone
    </h3>

    {!showDelete ? (
      <div className="flex items-center justify-between">
      <div>
      <p className="text-sm font-medium">Delete Account</p>
      <p className="text-xs text-muted-foreground">
      Permanently delete your account and all data. This cannot be undone.
      </p>
      </div>
      <Button
      size="sm"
      variant="outline"
      onClick={() => setShowDelete(true)}
      className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400"
      >
      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
      Delete Account
      </Button>
      </div>
    ) : (
      <div className="space-y-3 max-w-md">
      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
      <p className="text-xs text-red-400">
      This will permanently delete your account, all your links, analytics, and profile data.
      This action is irreversible.
      </p>
      </div>

      <div>
      <label className="text-xs text-muted-foreground">Enter your password</label>
      <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full h-9 px-3 rounded-lg bg-background border border-border text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-red-500"
      placeholder="Your current password"
      />
      </div>

      <div>
      <label className="text-xs text-muted-foreground">
      Type <span className="font-mono text-red-400">DELETE MY ACCOUNT</span> to confirm
      </label>
      <input
      type="text"
      value={confirmation}
      onChange={(e) => setConfirmation(e.target.value)}
      className="w-full h-9 px-3 rounded-lg bg-background border border-border text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-red-500"
      placeholder="DELETE MY ACCOUNT"
      />
      </div>

      <div className="flex gap-2">
      <Button
      size="sm"
      variant="outline"
      onClick={() => {
        setShowDelete(false);
        setPassword('');
        setConfirmation('');
      }}
      >
      Cancel
      </Button>
      <Button
      size="sm"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending || !password || confirmation !== 'DELETE MY ACCOUNT'}
      className="bg-red-600 hover:bg-red-700 text-white"
      >
      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
      {mutation.isPending ? 'Deleting...' : 'Permanently Delete'}
      </Button>
      </div>
      </div>
    )}
    </Card>
  );
}
