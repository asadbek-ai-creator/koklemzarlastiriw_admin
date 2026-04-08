import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/features/applications/application.service';
import type { CompleteWateringRequest } from '@/shared/types/api.types';

export const wateringKeys = {
  list: (appId: string) => ['watering-tasks', appId] as const,
};

export function useWateringTasks(applicationId: string) {
  return useQuery({
    queryKey: wateringKeys.list(applicationId),
    queryFn: () =>
      applicationService.getWateringTasks(applicationId).then((r) => r.data),
    enabled: !!applicationId,
  });
}

export function useCompleteWateringTask(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: CompleteWateringRequest }) =>
      applicationService.completeWateringTask(taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wateringKeys.list(applicationId) });
    },
  });
}
