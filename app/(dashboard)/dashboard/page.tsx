'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { linksService, type Link } from '@/lib/api/links';
import { analyticsService } from '@/lib/api/analytics';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Link2,
  BarChart3,
  ExternalLink,
  MousePointerClick,
  Eye,
  Plus,
  Palette,
  Crown,
  ArrowRight,
  ArrowUpRight,
  Copy,
  Check,
} from 'lucide-react';
import NextLink from 'next/link';
import { useState } from 'react';
import { toast } from '@/lib/hooks/use-toast';

const MAX_FREE_LINKS = 5;

export default function DashboardPage() {
  const { user } = useAuth();
  const isPro = user?.plan === 'PRO';
  const [copied, setCopied] = useState(false);

  const { data: links, isLoading: linksLoading } = useQuery({
    queryKey: ['links'],
    queryFn: linksService.getAll,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.get,
  });

  const activeLinks = (links || []).filter((l: Link) => l.isActive);
  const totalLinks = (links || []).length;
  const linkUsage = isPro ? null : totalLinks;
  const profileUrl = `https://${user?.username}.mysandbox.codes`;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Profile URL copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Error', description: 'Failed to copy', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.profile?.displayName || user?.username}
        </h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your link hub
        </p>
      </div>

      {/* Profile URL bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Your public page</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-emerald-500 truncate">
                {user?.username}.mysandbox.codes
              </code>
              <button
                onClick={copyUrl}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-initial">
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Preview
              </a>
            </Button>
            <Button asChild size="sm" className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white">
              <NextLink href="/links">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add link
              </NextLink>
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Links */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Links
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Link2 className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          {linksLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="space-y-2">
              <p className="text-3xl font-bold tracking-tight">{totalLinks}</p>
              {!isPro && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{totalLinks} of {MAX_FREE_LINKS} used</span>
                    <span>{MAX_FREE_LINKS - totalLinks} remaining</span>
                  </div>
                  <Progress
                    value={totalLinks}
                    max={MAX_FREE_LINKS}
                    indicatorClassName={
                      totalLinks >= MAX_FREE_LINKS
                        ? 'bg-destructive'
                        : totalLinks >= MAX_FREE_LINKS - 1
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }
                  />
                </div>
              )}
              {isPro && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>{activeLinks.length} active</span>
                  <span className="text-border">•</span>
                  <span>Unlimited</span>
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Total Clicks */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Clicks
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <MousePointerClick className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          {analyticsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight">
                {analytics?.totalClicks || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Last {analytics?.retentionDays || 7} days
                {!isPro && (
                  <span className="text-amber-500 ml-1">(7 days on Free)</span>
                )}
              </p>
            </div>
          )}
        </Card>

        {/* Top Link */}
        <Card className="p-5 space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Top Link
            </span>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-violet-500" />
            </div>
          </div>
          {analyticsLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : analytics?.linkStats && analytics.linkStats.length > 0 ? (
            <div className="space-y-1">
              <p className="text-base font-semibold truncate">
                {analytics.linkStats[0].title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {analytics.linkStats[0].clicks} clicks
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">No clicks yet</p>
              <p className="text-xs text-muted-foreground">
                Share your page to get started
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NextLink href="/links" className="group">
          <Card className="p-5 h-full hover:border-emerald-500/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                  <Link2 className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-sm">Manage Links</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Add, edit, reorder and toggle your links
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </div>
          </Card>
        </NextLink>

        <NextLink href="/appearance" className="group">
          <Card className="p-5 h-full hover:border-emerald-500/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-3">
                  <Palette className="h-5 w-5 text-violet-500" />
                </div>
                <h3 className="font-semibold text-sm">Customize Appearance</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Edit your profile, bio and choose a theme
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-500 transition-colors" />
            </div>
          </Card>
        </NextLink>

        <NextLink href="/analytics" className="group">
          <Card className="p-5 h-full hover:border-emerald-500/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-sm">View Analytics</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Track clicks, devices and locations
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            </div>
          </Card>
        </NextLink>
      </div>

      {/* Upgrade banner (FREE users only) */}
      {!isPro && (
        <Card className="p-5 border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-sm">Unlock the full experience</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unlimited links, custom themes, full analytics with 365-day retention, SEO tools and more for just R$ 9,90/month.
              </p>
            </div>
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              <NextLink href="/settings">
                Upgrade to PRO
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </NextLink>
            </Button>
          </div>
        </Card>
      )}

      {/* Recent links */}
      {!linksLoading && links && links.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent links</h3>
            <NextLink
              href="/links"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </NextLink>
          </div>
          <Card className="divide-y divide-border">
            {(links as Link[]).slice(0, 5).map((link: Link) => (
              <div
                key={link.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    link.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{link.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {link.url}
                  </p>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
