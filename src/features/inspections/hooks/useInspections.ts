import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/features/applications/application.service';
import type { InspectionRequest } from '@/shared/types/api.types';

export const inspectionKeys = {
  list: (appId: string) => ['inspections', appId] as const,
};

export function useInspections(applicationId: string) {
  return useQuery({
    queryKey: inspectionKeys.list(applicationId),
    queryFn: () =>
      applicationService.getInspections(applicationId).then((r) => r.data),
    enabled: !!applicationId,
  });
}

export function useCreateInspection(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InspectionRequest) =>
      applicationService.createInspection(applicationId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inspectionKeys.list(applicationId) });
    },
  });
}
