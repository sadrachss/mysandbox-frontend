'use client';

import { type Link } from '@/lib/api/links';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkCardProps {
  link: Link;
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
  isDragging?: boolean;
  dragHandleProps?: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
}

export function LinkCard({
  link,
  onToggle,
  onEdit,
  onDelete,
  isDragging,
  dragHandleProps,
}: LinkCardProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all',
        isDragging
          ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5 scale-[1.02] z-10'
          : 'border-border hover:border-border/80',
        !link.isActive && 'opacity-60'
      )}
    >
      {/* Drag handle */}
      <button
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors shrink-0"
        tabIndex={-1}
        {...dragHandleProps}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Active indicator */}
      <div
        className={cn(
          'h-2 w-2 rounded-full shrink-0',
          link.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30'
        )}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{link.title}</p>
        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
      </div>

      {/* Toggle */}
      <Switch
        checked={link.isActive}
        onCheckedChange={(checked) => onToggle(link.id, checked)}
        className="shrink-0"
      />

      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onEdit(link)} className="cursor-pointer">
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Open link
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(link)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
