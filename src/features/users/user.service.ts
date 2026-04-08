import { api } from '@/shared/api/axios.instance';
import type {
  RegisterRequest,
  UserEnvelope,
  UserListEnvelope,
  UserListParams,
} from '@/shared/types/api.types';

export const userService = {
  list: (params?: UserListParams) =>
    api.get<UserListEnvelope>('/users', { params }),

  createUser: (data: RegisterRequest) =>
    api.post<UserEnvelope>('/users', data),

  deactivateUser: (id: string) =>
    api.put<UserEnvelope>(`/users/${id}/deactivate`),
};
