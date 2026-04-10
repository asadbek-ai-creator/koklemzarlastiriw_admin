import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getStatusConfig } from '@/features/applications/lib/status.utils';
import type { ApplicationStatus } from '@/shared/types/api.types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn('gap-1 border', config.className, className)}
    >
      <Icon className="mr-1 h-3 w-3" />
      {t(config.label)}
    </Badge>
  );
}
