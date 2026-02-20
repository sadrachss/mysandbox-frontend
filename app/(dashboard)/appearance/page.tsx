'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, type Profile, type UpdateProfileData } from '@/lib/api/profile';
import { useAuthStore } from '@/lib/store/auth';
import { toast } from '@/lib/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Camera,
  Trash2,
  Save,
  Loader2,
  Check,
  X,
  AtSign,
  ExternalLink,
  Crown,
  Eye,
  AlertCircle,
  Circle,
  MessageSquare,
  Link2,
  Braces,
} from 'lucide-react';

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.mysandbox.codes';

export default function AppearancePage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isPro = user?.plan === 'PRO';

  // Fetch profile data
  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.get,
  });

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState<'available' | 'busy' | 'hybrid'>('available');
  const [statusMessage, setStatusMessage] = useState('');
  const [contactUrl, setContactUrl] = useState('');
  const [contactLabel, setContactLabel] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Username state
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const usernameTimer = useRef<NodeJS.Timeout | null>(null);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dirty tracking
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form from fetched data
  useEffect(() => {
    if (data) {
      setDisplayName(data.profile?.displayName || '');
      setBio(data.profile?.bio || '');
      setStatus(data.profile?.status || 'available');
      setStatusMessage(data.profile?.statusMessage || '');
      setContactUrl(data.profile?.contactUrl || '');
      setContactLabel(data.profile?.contactLabel || '');
      setMetaTitle(data.profile?.metaTitle || '');
      setMetaDescription(data.profile?.metaDescription || '');
      setUsername(data.user?.username || '');

      if (data.profile?.avatarUrl) {
        setAvatarPreview(`${CDN_URL}/avatars/${data.profile.avatarUrl}`);
      }
    }
  }, [data]);

  // Username availability check (debounced)
  const checkUsernameAvailability = useCallback((value: string) => {
    if (usernameTimer.current) clearTimeout(usernameTimer.current);

    if (value === data?.user?.username) {
      setUsernameAvailable(null);
      setUsernameChecking(false);
      return;
    }

    if (value.length < 3) {
      setUsernameAvailable(false);
      setUsernameChecking(false);
      return;
    }

    setUsernameChecking(true);
    usernameTimer.current = setTimeout(async () => {
      try {
        const result = await profileService.checkUsername(value);
        setUsernameAvailable(result.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);
  }, [data?.user?.username]);

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setUsername(cleaned);
    setIsDirty(true);
    checkUsernameAvailability(cleaned);
  };

  // Bio char limit
  const maxBio = isPro ? 500 : 150;

  // Avatar handlers
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ title: 'Invalid format', description: 'Use JPEG, PNG, or WebP', variant: 'destructive' });
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setIsDirty(true);
  };

  // Save mutations
  const profileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => profileService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: (data) => {
      setAvatarPreview(data.avatarUrl);
      setAvatarFile(null);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: () => profileService.deleteAvatar(),
    onSuccess: () => {
      setAvatarPreview(null);
      setAvatarFile(null);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const usernameMutation = useMutation({
    mutationFn: (username: string) => profileService.changeUsername(username),
    onSuccess: (data) => {
      if (user) {
        setUser({ ...user, username: data.username });
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Save all changes
  const handleSave = async () => {
    try {
      // Upload avatar if changed
      if (avatarFile) {
        await avatarMutation.mutateAsync(avatarFile);
      }

      // Update profile fields
      const profileData: UpdateProfileData = {
        displayName,
        bio: bio || null,
        status,
        statusMessage: statusMessage || null,
        contactUrl: contactUrl || null,
        contactLabel: contactLabel || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      };

      await profileMutation.mutateAsync(profileData);

      // Update username if changed
      if (username !== data?.user?.username && usernameAvailable) {
        await usernameMutation.mutateAsync(username);
      }

      setIsDirty(false);
      toast({ title: 'Profile saved', description: 'Your changes are live!' });
    } catch (error: any) {
      toast({
        title: 'Error saving',
        description: error.response?.data?.error || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const isSaving = profileMutation.isPending || avatarMutation.isPending || usernameMutation.isPending;

  const statusOptions = [
    { value: 'available' as const, label: 'Available', color: 'bg-emerald-500', dotClass: 'text-emerald-500' },
    { value: 'busy' as const, label: 'Busy', color: 'bg-red-500', dotClass: 'text-red-500' },
    { value: 'hybrid' as const, label: 'Hybrid', color: 'bg-amber-500', dotClass: 'text-amber-500' },
  ];

  const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
          <p className="text-sm text-muted-foreground">Customize your profile, bio, avatar and status.</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
          <p className="text-sm text-muted-foreground">
            Customize your profile, bio, avatar and status.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || (!isDirty && !avatarFile)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save changes
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ===== LEFT: Edit Form ===== */}
        <div className="xl:col-span-2 space-y-6">
          {/* Avatar Section */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              Profile Photo
            </h3>
            <div className="flex items-center gap-5">
              <div className="relative group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center ring-2 ring-border">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera className="h-5 w-5 text-white" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload photo
                  </Button>
                  {avatarPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (data?.profile?.avatarUrl) {
                          deleteAvatarMutation.mutate();
                        } else {
                          setAvatarPreview(null);
                          setAvatarFile(null);
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 5MB.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>
          </Card>

          {/* Profile Info */}
          <Card className="p-5 space-y-5">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Profile Info
            </h3>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); setIsDirty(true); }}
                placeholder="Your name or brand"
                maxLength={100}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio">Bio</Label>
                <span className={`text-xs ${bio.length > maxBio ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {bio.length}/{maxBio}
                </span>
              </div>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => { setBio(e.target.value); setIsDirty(true); }}
                placeholder="Tell visitors about yourself. Supports **bold**, `code`, and [links](url)."
                maxLength={maxBio}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Supports Markdown: **bold**, `code`, [link text](url)
              </p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="pl-9 pr-10 font-mono"
                  placeholder="your-username"
                  maxLength={30}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameChecking ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : username !== data?.user?.username ? (
                    usernameAvailable === true ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : usernameAvailable === false ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : null
                  ) : null}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your page: <span className="font-mono text-emerald-500">{username || '...'}.mysandbox.codes</span>
              </p>
            </div>
          </Card>

          {/* Status Badge */}
          <Card className="p-5 space-y-5">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              Status Badge
            </h3>

            {/* Status selector */}
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="flex gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setStatus(opt.value); setIsDirty(true); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      status === opt.value
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <div className={`h-2.5 w-2.5 rounded-full ${opt.color}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status message */}
            <div className="space-y-2">
              <Label htmlFor="statusMessage">Status Message (optional)</Label>
              <Input
                id="statusMessage"
                value={statusMessage}
                onChange={(e) => { setStatusMessage(e.target.value); setIsDirty(true); }}
                placeholder={
                  status === 'available' ? 'e.g. Open for freelance work' :
                  status === 'busy' ? 'e.g. Booked until March' :
                  'e.g. Part-time only'
                }
                maxLength={100}
              />
            </div>

            {/* Badge Preview */}
            <div className="space-y-2">
              <Label>Badge Preview</Label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div className={`h-3 w-3 rounded-full ${currentStatus.color} ${status === 'available' ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium">{currentStatus.label}</span>
                {statusMessage && (
                  <>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-sm text-muted-foreground">{statusMessage}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Embed in GitHub README: <code className="text-[11px] bg-muted px-1 py-0.5 rounded">
                  ![status](https://api.mysandbox.codes/public/{username}/badge)
                </code>
              </p>
            </div>
          </Card>

          {/* Quick Contact (PRO) */}
          <Card className={`p-5 space-y-5 ${!isPro ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Quick Contact
              </h3>
              {!isPro && (
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">
                  <Crown className="h-3 w-3 mr-1" />
                  PRO
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactLabel">Button Label</Label>
              <Input
                id="contactLabel"
                value={contactLabel}
                onChange={(e) => { setContactLabel(e.target.value); setIsDirty(true); }}
                placeholder={
                  status === 'available' ? 'e.g. Hire me' :
                  status === 'busy' ? 'e.g. Join waitlist' :
                  'e.g. Let\'s chat'
                }
                maxLength={50}
                disabled={!isPro}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactUrl">Contact URL</Label>
              <Input
                id="contactUrl"
                value={contactUrl}
                onChange={(e) => { setContactUrl(e.target.value); setIsDirty(true); }}
                placeholder="https://wa.me/5511..., mailto:you@..., https://calendly.com/..."
                maxLength={500}
                disabled={!isPro}
              />
              <p className="text-xs text-muted-foreground">
                WhatsApp, email, Calendly, or any link. Auto-adapts label based on your status.
              </p>
            </div>
          </Card>

          {/* SEO (PRO) */}
          <Card className={`p-5 space-y-5 ${!isPro ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                SEO & Sharing
              </h3>
              {!isPro && (
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">
                  <Crown className="h-3 w-3 mr-1" />
                  PRO
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaTitle">Page Title</Label>
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => { setMetaTitle(e.target.value); setIsDirty(true); }}
                placeholder={`${displayName || 'Your Name'} - MySandbox.codes`}
                maxLength={100}
                disabled={!isPro}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Input
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => { setMetaDescription(e.target.value); setIsDirty(true); }}
                placeholder="Short description for search engines and social sharing"
                maxLength={200}
                disabled={!isPro}
              />
            </div>
          </Card>
        </div>

        {/* ===== RIGHT: Live Preview ===== */}
        <div className="xl:col-span-1">
          <div className="sticky top-20">
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Live Preview
                  </span>
                  <a
                    href={`https://${username}.mysandbox.codes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    Open page
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Phone mockup */}
              <div className="bg-[#0a0e17] p-6 min-h-[500px] flex flex-col items-center">
                {/* Avatar preview */}
                <div className="mb-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-white/10"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400">
                      {(displayName || username || '?')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-slate-100 text-center mb-0.5">
                  {displayName || 'Your Name'}
                </h3>

                {/* Username */}
                <p className="text-xs font-mono text-slate-500 mb-1">
                  @{username || '...'}
                </p>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5 mb-3">
                  <div className={`h-2 w-2 rounded-full ${currentStatus.color} ${status === 'available' ? 'animate-pulse' : ''}`} />
                  <span className="text-xs text-slate-400">
                    {statusMessage || currentStatus.label}
                  </span>
                </div>

                {/* Bio preview with markdown */}
                {bio && (
                  <p className="text-sm text-slate-400 text-center mb-5 max-w-[240px] leading-relaxed">
                    <MarkdownPreview text={bio} />
                  </p>
                )}

                {/* Quick Contact CTA */}
                {isPro && contactLabel && contactUrl && (
                  <button className="w-full max-w-[240px] mb-4 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium text-center hover:bg-emerald-700 transition-colors">
                    {contactLabel}
                  </button>
                )}

                {/* Sample links placeholder */}
                <div className="w-full max-w-[240px] space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 text-center"
                    >
                      <div className={`h-2.5 rounded-full bg-slate-700 mx-auto`} style={{ width: `${60 + i * 10}%` }} />
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-8 flex items-center gap-1 text-[10px] text-slate-600">
                  <Braces className="h-2.5 w-2.5" />
                  <span>MySandbox.codes</span>
                </div>
              </div>
            </Card>

            {/* JSON API info */}
            <Card className="mt-4 p-4 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Braces className="h-3.5 w-3.5" />
                Developer API
              </h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-[10px] font-mono px-1.5">GET</Badge>
                  <code className="text-emerald-500 text-[11px] truncate">
                    /public/{username}/json
                  </code>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-[10px] font-mono px-1.5">GET</Badge>
                  <code className="text-emerald-500 text-[11px] truncate">
                    /public/{username}/badge
                  </code>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Use the JSON endpoint in GitHub READMEs, portfolios, or any fetch call. The badge endpoint returns an SVG status badge.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Simple Markdown Preview (inline)
// ============================================
function MarkdownPreview({ text }: { text: string }) {
  // Simple markdown: **bold**, `code`, [text](url)
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`|\[.*?\]\(.*?\))/g);

  return (
    <>
      {parts.map((part, i) => {
        // Bold
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-slate-200">{part.slice(2, -2)}</strong>;
        }
        // Code
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="px-1 py-0.5 rounded bg-slate-800 text-emerald-400 text-xs font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        // Link
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          return (
            <a
              key={i}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline underline-offset-2"
            >
              {linkMatch[1]}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
