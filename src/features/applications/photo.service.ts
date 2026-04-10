import { api } from '@/shared/api/axios.instance';
import type {
  ApiEnvelope,
  ApplicationPhoto,
  WateringPhoto,
} from '@/shared/types/api.types';

// ── Photo upload service ────────────────────────────────────
//
// Photos are uploaded as `multipart/form-data` under the field
// name `photos`. Axios automatically attaches the correct
// boundary header when the body is a `FormData` instance — we
// only need to override the per-request `Content-Type` so the
// JSON default from the axios instance does not win.

function buildFormData(files: File[]): FormData {
  const fd = new FormData();
  files.forEach((file) => fd.append('photos', file, file.name));
  return fd;
}

export const photoService = {
  uploadApplicationPhotos: (applicationId: string, files: File[]) =>
    api.post<ApiEnvelope<ApplicationPhoto[]>>(
      `/applications/${applicationId}/photos`,
      buildFormData(files),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    ),

  uploadWateringPhotos: (taskId: string, files: File[]) =>
    api.post<ApiEnvelope<WateringPhoto[]>>(
      `/watering-tasks/${taskId}/photos`,
      buildFormData(files),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    ),
};
