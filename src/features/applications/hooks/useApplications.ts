import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { applicationService } from '@/features/applications/application.service';
import type {
  ApplicationListParams,
  CreateApplicationRequest,
  UpdateApplicationStatusRequest,
  ReviewRequest,
  SignRequest,
} from '@/shared/types/api.types';

export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (params: ApplicationListParams) => [...applicationKeys.lists(), params] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const,
};

export function useApplications(params: ApplicationListParams) {
  return useQuery({
    queryKey: applicationKeys.list(params),
    queryFn: () => applicationService.list(params).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApplicationRequest) =>
      applicationService.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

// ── Unified workflow mutation ───────────────────────────────
//
// One hook for every status change (submit / approve / sign /
// reject / clarify). The server validates whether the current
// user's role may perform the requested transition; this hook
// just dispatches and invalidates the relevant caches.

export interface UpdateApplicationStatusVariables
  extends UpdateApplicationStatusRequest {
  id: string;
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateApplicationStatusVariables) =>
      applicationService.updateStatus(id, body).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: applicationKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

// ── Swagger-compliant review / sign mutations ──────────────

export interface ReviewApplicationVariables extends ReviewRequest {
  id: string;
}

export function useReviewApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: ReviewApplicationVariables) =>
      applicationService.review(id, body).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: applicationKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export interface SignApplicationVariables extends SignRequest {
  id: string;
}

export function useSignApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: SignApplicationVariables) =>
      applicationService.sign(id, body).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: applicationKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}
