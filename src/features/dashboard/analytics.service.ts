import { api } from '@/shared/api/axios.instance';
import type {
  DistrictStatsEnvelope,
  DistrictStatsParams,
  AuditLogListEnvelope,
  AuditLogListParams,
} from '@/shared/types/api.types';

export const analyticsService = {
  getDistrictStats: (params?: DistrictStatsParams) =>
    api.get<DistrictStatsEnvelope>('/analytics/districts', { params }),

  getAuditLogs: (params?: AuditLogListParams) =>
    api.get<AuditLogListEnvelope>('/audit-logs', { params }),

  getApplicationAuditLogs: (applicationId: string) =>
    api.get('/audit-logs/application/' + applicationId),
};
