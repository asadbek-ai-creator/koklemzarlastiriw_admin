import {
  FileEdit,
  Clock,
  CheckCircle2,
  XCircle,
  Droplets,
  Leaf,
  type LucideIcon,
} from 'lucide-react';
import type { ApplicationStatus } from '@/shared/types/api.types';

// ── Status config ─────────────────────────────────────────
//
// Each status carries:
//   - a short human label
//   - the lucide icon shown inside the badge
//   - a tailwind `className` tone (bg + text + border) using
//     direct palette colors rather than shadcn variant props,
//     so every status gets its own distinct chip (the stock
//     Badge variants only give us 4 colors).

export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

const statusMap: Record<ApplicationStatus, StatusConfig> = {
  draft: {
    label: 'status.draft',
    icon: FileEdit,
    className:
      'bg-muted text-muted-foreground border-border',
  },
  pending_admin: {
    label: 'status.pending_admin',
    icon: Clock,
    className:
      'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  },
  pending_superadmin: {
    label: 'status.pending_superadmin',
    icon: Clock,
    className:
      'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  },
  clarification_needed: {
    label: 'status.clarification_needed',
    icon: Clock,
    className:
      'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  },
  signed: {
    label: 'status.signed',
    icon: CheckCircle2,
    className:
      'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  completed: {
    label: 'status.completed',
    icon: Leaf,
    className:
      'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  rejected: {
    label: 'status.rejected',
    icon: XCircle,
    className:
      'bg-red-100 text-red-900 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  },
  watering_in_progress: {
    label: 'status.watering_in_progress',
    icon: Droplets,
    className:
      'bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
  },
};

export function getStatusConfig(status: ApplicationStatus): StatusConfig {
  return (
    statusMap[status] ?? {
      label: `status.${status}`,
      icon: FileEdit,
      className: 'bg-muted text-muted-foreground border-border',
    }
  );
}

export const ALL_STATUSES: ApplicationStatus[] = [
  'draft',
  'pending_admin',
  'pending_superadmin',
  'signed',
  'rejected',
  'clarification_needed',
  'watering_in_progress',
  'completed',
];
