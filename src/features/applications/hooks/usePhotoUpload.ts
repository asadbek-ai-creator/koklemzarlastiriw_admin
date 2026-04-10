import { useMutation, useQueryClient } from '@tanstack/react-query';
import { photoService } from '@/features/applications/photo.service';
import { applicationKeys } from '@/features/applications/hooks/useApplications';
import { wateringKeys } from '@/features/applications/hooks/useWateringTasks';

// ── Application photos ─────────────────────────────────────

interface UploadAppPhotosVars {
  applicationId: string;
  files: File[];
}

export function useUploadApplicationPhotos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, files }: UploadAppPhotosVars) =>
      photoService.uploadApplicationPhotos(applicationId, files).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: applicationKeys.detail(variables.applicationId),
      });
    },
  });
}

// ── Watering photos ────────────────────────────────────────

interface UploadWateringPhotosVars {
  applicationId: string;
  taskId: string;
  files: File[];
}

export function useUploadWateringPhotos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, files }: UploadWateringPhotosVars) =>
      photoService.uploadWateringPhotos(taskId, files).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: wateringKeys.list(variables.applicationId) });
    },
  });
}
