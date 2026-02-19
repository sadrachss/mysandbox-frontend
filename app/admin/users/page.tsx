'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/admin';
import { useAuthStore } from '@/lib/store/auth';
import { toast } from 'sonner';
import {
  Search,
  UserPlus,
  Ban,
  CheckCircle,
  Crown,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Key,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [passwordUser, setPasswordUser] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, plan: planFilter, status: statusFilter, page }],
    queryFn: () => adminService.getUsers({ search: search || undefined, plan: planFilter, status: statusFilter !== 'all' ? statusFilter : undefined, page }),
  });

  const banMutation = useMutation({
    mutationFn: adminService.banUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('User banned'); },
  });

  const unbanMutation = useMutation({
    mutationFn: adminService.unbanUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('User unbanned'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => adminService.updateUser(id, body),
                                     onSuccess: () => {
                                       queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
                                       toast.success('User updated');
                                       setEditUser(null);
                                     },
                                     onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update user'),
  });

  const createMutation = useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User created');
      setShowCreate(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to create user'),
  });

  const passwordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) => adminService.changePassword(id, newPassword),
                                       onSuccess: () => {
                                         toast.success('Password changed');
                                         setPasswordUser(null);
                                       },
                                       onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to change password'),
  });

  const users = data?.users || [];
  const pagination = data?.pagination;

  // Check if current logged-in user is the super admin
  const isMeSuperAdmin = users.find((u: any) => u.id === currentUser?.id)?.isSuperAdmin ?? false;

  return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold">Users</h1>
    <Button size="sm" onClick={() => setShowCreate(true)} className="bg-emerald-600 hover:bg-emerald-700">
    <UserPlus className="h-4 w-4 mr-1.5" />
    Add User
    </Button>
    </div>

    {/* Filters */}
    <div className="flex flex-wrap gap-3">
    <div className="relative flex-1 min-w-[200px]">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <input
    type="text"
    placeholder="Search email or username..."
    value={search}
    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
    className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20"
    />
    </div>
    <select
    value={planFilter}
    onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
    className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm"
    >
    <option value="all">All Plans</option>
    <option value="FREE">Free</option>
    <option value="PRO">PRO</option>
    </select>
    <select
    value={statusFilter}
    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
    className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm"
    >
    <option value="all">All Status</option>
    <option value="active">Active</option>
    <option value="banned">Banned</option>
    </select>
    </div>

    {/* Table */}
    <div className="rounded-xl border border-white/5 overflow-hidden">
    <table className="w-full text-sm">
    <thead className="bg-white/[0.03]">
    <tr className="text-left text-muted-foreground text-xs">
    <th className="px-4 py-3">User</th>
    <th className="px-4 py-3">Plan</th>
    <th className="px-4 py-3">Links</th>
    <th className="px-4 py-3">Status</th>
    <th className="px-4 py-3">Joined</th>
    <th className="px-4 py-3 text-right">Actions</th>
    </tr>
    </thead>
    <tbody className="divide-y divide-white/5">
    {isLoading ? (
      Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-8 bg-white/5 rounded animate-pulse" /></td></tr>
      ))
    ) : users.length === 0 ? (
      <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
    ) : (
      users.map((user: any) => (
        <tr key={user.id} className="hover:bg-white/[0.02]">
        <td className="px-4 py-3">
        <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
        {user.profile?.avatarUrl ? (
          <img src={user.profile.avatarUrl} className="h-8 w-8 rounded-full object-cover" alt="" />
        ) : (
          user.username?.[0]?.toUpperCase()
        )}
        </div>
        <div>
        <p className="font-medium flex items-center gap-1.5">
        {user.profile?.displayName || user.username}
        {user.isSuperAdmin && (
          <span className="text-[10px] px-1 py-0 bg-amber-500/20 text-amber-400 rounded flex items-center gap-0.5">
          <ShieldAlert className="h-2.5 w-2.5" />
          SUPER
          </span>
        )}
        {user.isAdmin && !user.isSuperAdmin && (
          <span className="text-[10px] px-1 py-0 bg-red-500/20 text-red-400 rounded">ADMIN</span>
        )}
        </p>
        <p className="text-xs text-muted-foreground">@{user.username} · {user.email}</p>
        </div>
        </div>
        </td>
        <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          user.plan === 'PRO' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-white/40'
        }`}>
        {user.plan}
        </span>
        </td>
        <td className="px-4 py-3 text-muted-foreground">{user._count?.links || 0}</td>
        <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
        {user.isActive ? 'Active' : 'Banned'}
        </span>
        </td>
        <td className="px-4 py-3 text-muted-foreground text-xs">
        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
        </td>
        <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
        {/* Edit - hide for super admin if current user is not super admin */}
        {(!user.isSuperAdmin || isMeSuperAdmin) && (
          <button
          onClick={() => setEditUser(user)}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-white/10 text-muted-foreground hover:text-white"
          title="Edit"
          >
          <Edit className="h-3.5 w-3.5" />
          </button>
        )}
        {/* Change password - hide for super admin if current user is not super admin */}
        {(!user.isSuperAdmin || isMeSuperAdmin) && (
          <button
          onClick={() => setPasswordUser(user)}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-amber-500/10 text-muted-foreground hover:text-amber-400"
          title="Change password"
          >
          <Key className="h-3.5 w-3.5" />
          </button>
        )}
        <a
        href={`https://${user.username}.mysandbox.codes`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-7 w-7 flex items-center justify-center rounded hover:bg-white/10 text-muted-foreground hover:text-white"
        title="View profile"
        >
        <ExternalLink className="h-3.5 w-3.5" />
        </a>
        {/* Ban/Unban - never show for super admin, never show for admins unless current is super */}
        {!user.isSuperAdmin && !user.isAdmin && (
          user.isActive ? (
            <button
            onClick={() => banMutation.mutate(user.id)}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
            title="Ban"
            >
            <Ban className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
            onClick={() => unbanMutation.mutate(user.id)}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400"
            title="Unban"
            >
            <CheckCircle className="h-3.5 w-3.5" />
            </button>
          )
        )}
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
      <span>{pagination.total} users total</span>
      <div className="flex items-center gap-2">
      <button
      onClick={() => setPage(p => Math.max(1, p - 1))}
      disabled={page === 1}
      className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30"
      >
      <ChevronLeft className="h-4 w-4" />
      </button>
      <span>{page} / {pagination.totalPages}</span>
      <button
      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
      disabled={page === pagination.totalPages}
      className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30"
      >
      <ChevronRight className="h-4 w-4" />
      </button>
      </div>
      </div>
    )}

    {/* Edit User Modal */}
    {editUser && (
      <EditUserModal
      user={editUser}
      isMeSuperAdmin={isMeSuperAdmin}
      onClose={() => setEditUser(null)}
      onSave={(body: any) => updateMutation.mutate({ id: editUser.id, body })}
      loading={updateMutation.isPending}
      />
    )}

    {/* Create User Modal */}
    {showCreate && (
      <CreateUserModal
      onClose={() => setShowCreate(false)}
      onSave={(body: any) => createMutation.mutate(body)}
      loading={createMutation.isPending}
      />
    )}

    {/* Change Password Modal */}
    {passwordUser && (
      <ChangePasswordModal
      user={passwordUser}
      onClose={() => setPasswordUser(null)}
      onSave={(newPassword: string) => passwordMutation.mutate({ id: passwordUser.id, newPassword })}
      loading={passwordMutation.isPending}
      />
    )}
    </div>
  );
}

// Edit User Modal
function EditUserModal({ user, isMeSuperAdmin, onClose, onSave, loading }: any) {
  const [form, setForm] = useState({
    email: user.email,
    username: user.username,
    displayName: user.profile?.displayName || '',
    plan: user.plan,
    isAdmin: user.isAdmin || false,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-[#0f1420] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
    <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold">Edit User</h2>
    <button onClick={onClose} className="text-muted-foreground hover:text-white"><X className="h-4 w-4" /></button>
    </div>

    {user.isSuperAdmin && (
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
      <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
      <p className="text-xs text-amber-300">Super Admin — role and status cannot be changed.</p>
      </div>
    )}

    <div className="space-y-3">
    <div>
    <label className="text-xs text-muted-foreground">Email</label>
    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm mt-1" />
    </div>
    <div>
    <label className="text-xs text-muted-foreground">Username</label>
    <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm mt-1" />
    </div>
    <div>
    <label className="text-xs text-muted-foreground">Display Name</label>
    <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm mt-1" />
    </div>
    <div className="flex gap-3">
    <div className="flex-1">
    <label className="text-xs text-muted-foreground">Plan</label>
    <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm mt-1">
    <option value="FREE">Free</option>
    <option value="PRO">PRO</option>
    </select>
    </div>
    {/* Only super admin can see and change admin toggle */}
    {isMeSuperAdmin && !user.isSuperAdmin && (
      <div className="flex-1">
      <label className="text-xs text-muted-foreground">Admin</label>
      <select value={form.isAdmin ? 'yes' : 'no'} onChange={e => setForm(f => ({ ...f, isAdmin: e.target.value === 'yes' }))}
      className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm mt-1">
      <option value="no">No</option>
      <option value="yes">Yes</option>
      </select>
      </div>
    )}
    </div>
    </div>

    <div className="flex justify-end gap-2 pt-2">
    <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
    <Button size="sm" onClick={() => {
      const body: any = { ...form };
      // Don't send isAdmin if not super admin
      if (!isMeSuperAdmin || user.isSuperAdmin) delete body.isAdmin;
      onSave(body);
    }} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
    {loading ? 'Saving...' : 'Save'}
    </Button>
    </div>
    </div>
    </div>
  );
}

// Create User Modal
function CreateUserModal({ onClose, onSave, loading }: any) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
    plan: 'FREE',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-[#0f1420] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
    <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold">Create User</h2>
    <button onClick={onClose} className="text-muted-foreground hover:text-white"><X className="h-4 w-4" /></button>
    </div>

    <div className="space-y-3">
    <div>
    <label className="text-xs text-muted-foreground">Display Name</label>
    <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
    placeholder="John Doe"
    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm mt-1" />
    </div>
    <div>
    <label className="text-xs text-muted-foreground">Username</label>
    <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase() }))}
    placeholder="johndoe"
    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm mt-1" />
    </div>
    <div>
    <label className="text-xs text-muted-foreground">Email</label>
    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
    placeholder="john@example.com" type="email"
    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm mt-1" />
    </div>
    <div>
    <label className="text-xs text-muted-foreground">Password</label>
    <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
    placeholder="Min 8 characters" type="password"
    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm mt-1" />
    </div>
    <div>
    <label className="text-xs text-muted-foreground">Plan</label>
    <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm mt-1">
    <option value="FREE">Free</option>
    <option value="PRO">PRO</option>
    </select>
    </div>
    </div>

    <div className="flex justify-end gap-2 pt-2">
    <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
    <Button size="sm" onClick={() => onSave(form)} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
    {loading ? 'Creating...' : 'Create'}
    </Button>
    </div>
    </div>
    </div>
  );
}

// Change Password Modal
function ChangePasswordModal({ user, onClose, onSave, loading }: any) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    onSave(newPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-[#0f1420] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
    <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold">Change Password</h2>
    <button onClick={onClose} className="text-muted-foreground hover:text-white"><X className="h-4 w-4" /></button>
    </div>

    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
    <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
    {user.username?.[0]?.toUpperCase()}
    </div>
    <div>
    <p className="text-sm font-medium">{user.profile?.displayName || user.username}</p>
    <p className="text-xs text-muted-foreground">{user.email}</p>
    </div>
    </div>

    <div className="space-y-3">
    <div>
    <label className="text-xs text-muted-foreground">New Password</label>
    <input
    type="password"
    value={newPassword}
    onChange={e => setNewPassword(e.target.value)}
    placeholder="Min 8 characters"
    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm mt-1"
    />
    </div>
    <div>
    <label className="text-xs text-muted-foreground">Confirm Password</label>
    <input
    type="password"
    value={confirmPassword}
    onChange={e => setConfirmPassword(e.target.value)}
    placeholder="Repeat password"
    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm mt-1"
    />
    </div>
    </div>

    <div className="flex justify-end gap-2 pt-2">
    <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
    <Button size="sm" onClick={handleSave} disabled={loading || !newPassword} className="bg-amber-600 hover:bg-amber-700">
    <Key className="h-3.5 w-3.5 mr-1.5" />
    {loading ? 'Changing...' : 'Change Password'}
    </Button>
    </div>
    </div>
    </div>
  );
}
