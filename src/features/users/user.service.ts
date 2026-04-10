import { api } from '@/shared/api/axios.instance';
import type {
  RegisterRequest,
  UpdateUserReq,
  UserEnvelope,
  UserListEnvelope,
  UserListParams,
} from '@/shared/types/api.types';

export const userService = {
  list: (params?: UserListParams) =>
    api.get<UserListEnvelope>('/users', { params }),

  createUser: (data: RegisterRequest) =>
    api.post<UserEnvelope>('/users', data),

  updateUser: (id: string, data: UpdateUserReq) =>
    api.put<UserEnvelope>(`/users/${id}`, data),

  deactivateUser: (id: string) =>
    api.put<UserEnvelope>(`/users/${id}/deactivate`),
};
