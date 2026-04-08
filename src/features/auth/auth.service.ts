import { api } from '@/shared/api/axios.instance';
import type {
  LoginRequest,
  LoginResponseEnvelope,
  ChangePasswordRequest,
  UserEnvelope,
} from '@/shared/types/api.types';

export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponseEnvelope>('/auth/login', data),

  me: () =>
    api.get<UserEnvelope>('/auth/me'),

  changePassword: (data: ChangePasswordRequest) =>
    api.put('/auth/change-password', data),
};
