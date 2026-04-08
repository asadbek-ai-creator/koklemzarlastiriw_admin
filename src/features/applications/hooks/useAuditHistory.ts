import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/features/dashboard/analytics.service';
import type { AuditLog } from '@/shared/types/api.types';

export function useApplicationAuditLogs(applicationId: string) {
  return useQuery({
    queryKey: ['audit-logs', 'application', applicationId],
    queryFn: () =>
      analyticsService
        .getApplicationAuditLogs(applicationId)
        .then((r) => r.data as { success: boolean; data: AuditLog[] }),
    enabled: !!applicationId,
  });
}
