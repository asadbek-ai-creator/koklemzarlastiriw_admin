import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { applicationService } from '@/features/applications/application.service';
import { inspectionService } from '@/features/inspections/inspection.service';
import type {
  InspectionRequest,
  InspectionListParams,
} from '@/shared/types/api.types';

export const inspectionKeys = {
  all: ['inspections'] as const,
  global: (params: InspectionListParams) => ['inspections', 'global', params] as const,
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

export function useGlobalInspections(params: InspectionListParams) {
  return useQuery({
    queryKey: inspectionKeys.global(params),
    queryFn: () => inspectionService.list(params).then((r) => r.data),
    placeholderData: keepPreviousData,
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
