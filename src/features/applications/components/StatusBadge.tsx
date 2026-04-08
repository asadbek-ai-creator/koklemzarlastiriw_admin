import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getStatusConfig } from '@/features/applications/lib/status.utils';
import type { ApplicationStatus } from '@/shared/types/api.types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

/**
 * Color-coded application status chip. Each of the 9 Swagger
 * statuses carries its own tone + lucide icon, defined in
 * `status.utils.ts`. We render on top of the shadcn <Badge>
 * primitive using a transparent base variant so the per-status
 * classes fully own the background/text colors.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn('gap-1 border', config.className, className)}
    >
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
