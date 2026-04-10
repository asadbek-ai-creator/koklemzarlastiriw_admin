import { api } from '@/shared/api/axios.instance';
import type {
  CreateDistrictReq,
  UpdateDistrictReq,
  DistrictEnvelope,
  DistrictListEnvelope,
} from '@/shared/types/api.types';

export const districtService = {
  list: () =>
    api.get<DistrictListEnvelope>('/districts'),

  createDistrict: (data: CreateDistrictReq) =>
    api.post<DistrictEnvelope>('/districts', data),

  updateDistrict: (id: string, data: UpdateDistrictReq) =>
    api.put<DistrictEnvelope>(`/districts/${id}`, data),

  deleteDistrict: (id: string) =>
    api.delete(`/districts/${id}`),
};
