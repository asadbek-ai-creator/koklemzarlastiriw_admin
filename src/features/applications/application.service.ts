import { api } from '@/shared/api/axios.instance';
import type {
  ApplicationEnvelope,
  ApplicationListEnvelope,
  ApplicationListParams,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  UpdateApplicationStatusRequest,
  ReviewRequest,
  SignRequest,
  WateringTaskListEnvelope,
  CompleteWateringRequest,
  InspectionRequest,
  InspectionListEnvelope,
} from '@/shared/types/api.types';

export const applicationService = {
  // ── CRUD ────────────────────────────────────────────────────
  list: (params?: ApplicationListParams) =>
    api.get<ApplicationListEnvelope>('/applications', { params }),

  getById: (id: string) =>
    api.get<ApplicationEnvelope>(`/applications/${id}`),

  create: (data: CreateApplicationRequest) =>
    api.post<ApplicationEnvelope>('/applications', data),

  update: (id: string, data: UpdateApplicationRequest) =>
    api.put<ApplicationEnvelope>(`/applications/${id}`, data),

  delete: (id: string) =>
    api.delete(`/applications/${id}`),

  // ── Workflow transitions ────────────────────────────────────
  // Single endpoint for every status change. The server derives
  // the actor's role from the bearer token and validates the
  // (current → next) transition. See ALLOWED_TRANSITIONS in the
  // mock handler / backend for the rules.
  updateStatus: (id: string, data: UpdateApplicationStatusRequest) =>
    api.patch<ApplicationEnvelope>(`/applications/${id}/status`, data),

  // ── Swagger-compliant review/sign endpoints ────────────────
  //
  // Admin reviews an application (approve / reject / clarify):
  //   POST /applications/:id/review
  //   body: { action, admin_notes?, reject_reason? }
  //
  // Super admin signs or rejects an application:
  //   POST /applications/:id/sign
  //   body: { action, signature_secret, reject_reason? }
  review: (id: string, data: ReviewRequest) =>
    api.post<ApplicationEnvelope>(`/applications/${id}/review`, data),

  sign: (id: string, data: SignRequest) =>
    api.post<ApplicationEnvelope>(`/applications/${id}/sign`, data),

  // ── Watering tasks ─────────────────────────────────────────
  getWateringTasks: (applicationId: string) =>
    api.get<WateringTaskListEnvelope>(`/applications/${applicationId}/watering-tasks`),

  completeWateringTask: (taskId: string, data: CompleteWateringRequest) =>
    api.post(`/watering-tasks/${taskId}/complete`, data),

  // ── Inspections ────────────────────────────────────────────
  createInspection: (applicationId: string, data: InspectionRequest) =>
    api.post(`/applications/${applicationId}/inspections`, data),

  getInspections: (applicationId: string) =>
    api.get<InspectionListEnvelope>(`/applications/${applicationId}/inspections`),
};
