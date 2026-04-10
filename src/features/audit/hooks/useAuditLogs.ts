import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/features/dashboard/analytics.service';
import type { AuditLogListParams } from '@/shared/types/api.types';

// ─────────────────────────────────────────────────────────────
//  Global audit-log feed (Super Admin only).
//
//  The backend mounts the list endpoint at GET /audit-logs and
//  accepts the standard pagination + filter params declared in
//  AuditLogListParams. We use `keepPreviousData` so the table
//  doesn't blank out between pages while a new fetch is in
//  flight.
// ─────────────────────────────────────────────────────────────

export function useAuditLogs(params: AuditLogListParams) {
  return useQuery({
    queryKey: ['audit-logs', 'global', params],
    queryFn: () => analyticsService.getAuditLogs(params).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
}
