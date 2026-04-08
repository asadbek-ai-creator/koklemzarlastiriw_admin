import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/features/dashboard/analytics.service';
import type { DistrictStatsParams } from '@/shared/types/api.types';

export function useDistrictStats(params?: DistrictStatsParams) {
  return useQuery({
    queryKey: ['analytics', 'districts', params],
    queryFn: () => analyticsService.getDistrictStats(params).then((r) => r.data),
  });
}
