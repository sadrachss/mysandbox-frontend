'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linksService, type Link } from '@/lib/api/links';
import { useAuthStore } from '@/lib/store/auth';
import { toast } from '@/lib/hooks/use-toast';
import { type LinkFormData } from '@/lib/validations/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { LinkCard } from '@/components/links/link-card';
import { LinkFormDialog } from '@/components/links/link-form-dialog';
import { DeleteLinkDialog } from '@/components/links/delete-link-dialog';
import { UpgradeDialog } from '@/components/links/upgrade-dialog';
import { Plus, Link2, Crown } from 'lucide-react';

const MAX_FREE_LINKS = 5;

export default function LinksPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isPro = user?.plan === 'PRO';

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<number | null>(null);

  // Fetch links
  const { data: links = [], isLoading } = useQuery<Link[]>({
    queryKey: ['links'],
    queryFn: linksService.getAll,
  });

  const totalLinks = links.length;
  const canAddLink = isPro || totalLinks < MAX_FREE_LINKS;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: LinkFormData) => linksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setFormOpen(false);
      toast({ title: 'Link created', description: 'Your new link has been added.' });
    },
    onError: (error: any) => {
      if (error.response?.data?.upgrade) {
        setFormOpen(false);
        setUpgradeOpen(true);
        return;
      }
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create link.',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Link> }) =>
      linksService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setEditingLink(null);
      setFormOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update link.',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => linksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setDeletingLink(null);
      toast({ title: 'Link deleted', description: 'The link has been removed.' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete link.',
        variant: 'destructive',
      });
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: (linkIds: string[]) => linksService.reorder(linkIds),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({
        title: 'Error',
        description: 'Failed to reorder links.',
        variant: 'destructive',
      });
    },
  });

  // Toggle active/inactive
  const handleToggle = useCallback(
    (id: string, isActive: boolean) => {
      // Optimistic update
      queryClient.setQueryData<Link[]>(['links'], (old) =>
        old?.map((l) => (l.id === id ? { ...l, isActive } : l))
      );
      updateMutation.mutate(
        { id, data: { isActive } },
        {
          onSuccess: () => {
            toast({
              title: isActive ? 'Link activated' : 'Link deactivated',
              description: isActive
                ? 'This link is now visible on your page.'
                : 'This link is now hidden from your page.',
            });
          },
        }
      );
    },
    [queryClient, updateMutation]
  );

  // Add link handler
  const handleAddClick = () => {
    if (!canAddLink) {
      setUpgradeOpen(true);
      return;
    }
    setEditingLink(null);
    setFormOpen(true);
  };

  // Edit link handler
  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setFormOpen(true);
  };

  // Form submit
  const handleFormSubmit = (data: LinkFormData) => {
    if (editingLink) {
      updateMutation.mutate({ id: editingLink.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Drag & drop handlers
  const handleDragStart = (index: number) => {
    dragNodeRef.current = index;
    setDragIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (dragNodeRef.current === null) return;
    if (dragNodeRef.current === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragNodeRef.current === null || dragOverIndex === null) {
      setDragIndex(null);
      setDragOverIndex(null);
      dragNodeRef.current = null;
      return;
    }

    const fromIndex = dragNodeRef.current;
    const toIndex = dragOverIndex;

    if (fromIndex === toIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      dragNodeRef.current = null;
      return;
    }

    // Reorder optimistically
    const newLinks = [...links];
    const [moved] = newLinks.splice(fromIndex, 1);
    newLinks.splice(toIndex, 0, moved);

    // Update positions
    const reordered = newLinks.map((link, i) => ({ ...link, position: i }));
    queryClient.setQueryData(['links'], reordered);

    // Persist to API
    reorderMutation.mutate(reordered.map((l) => l.id));

    setDragIndex(null);
    setDragOverIndex(null);
    dragNodeRef.current = null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Links</h2>
            {!isPro && (
              <Badge variant="secondary" className="text-xs">
                {totalLinks}/{MAX_FREE_LINKS}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your link hub. Drag to reorder, toggle visibility.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleAddClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add link
        </Button>
      </div>

      {/* Link limit bar (FREE only) */}
      {!isPro && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {totalLinks} of {MAX_FREE_LINKS} links used
            </span>
            {totalLinks >= MAX_FREE_LINKS && (
              <button
                onClick={() => setUpgradeOpen(true)}
                className="text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <Crown className="h-3 w-3" />
                Upgrade for unlimited
              </button>
            )}
          </div>
          <Progress
            value={totalLinks}
            max={MAX_FREE_LINKS}
            indicatorClassName={
              totalLinks >= MAX_FREE_LINKS
                ? 'bg-destructive'
                : totalLinks >= MAX_FREE_LINKS - 1
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }
          />
        </Card>
      )}

      {/* Links list */}
      {links.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <Link2 className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="font-semibold mb-1">No links yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Add your first link to start building your hub. Share your portfolio, GitHub, social media and more.
          </p>
          <Button
            size="sm"
            onClick={handleAddClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add your first link
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {links.map((link: Link, index: number) => (
            <div
              key={link.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={handleDragEnd}
              className={
                dragOverIndex === index && dragIndex !== index
                  ? dragIndex !== null && dragIndex < index
                    ? 'border-b-2 border-emerald-500 pb-1'
                    : 'border-t-2 border-emerald-500 pt-1'
                  : ''
              }
            >
              <LinkCard
                link={link}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={setDeletingLink}
                isDragging={dragIndex === index}
                dragHandleProps={{
                  onMouseDown: () => {},
                  onTouchStart: () => {},
                }}
              />
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground text-center pt-2">
            Drag links to reorder. Changes save automatically.
          </p>
        </div>
      )}

      {/* Add/Edit dialog */}
      <LinkFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingLink(null);
        }}
        link={editingLink}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete confirmation */}
      {deletingLink && (
        <DeleteLinkDialog
          open={!!deletingLink}
          onOpenChange={(open) => {
            if (!open) setDeletingLink(null);
          }}
          linkTitle={deletingLink.title}
          onConfirm={() => deleteMutation.mutate(deletingLink.id)}
          isLoading={deleteMutation.isPending}
        />
      )}

      {/* Upgrade dialog */}
      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
