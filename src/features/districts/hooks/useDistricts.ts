import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { districtService } from '@/features/districts/district.service';
import type {
  CreateDistrictReq,
  UpdateDistrictReq,
} from '@/shared/types/api.types';

export const districtKeys = {
  all: ['districts'] as const,
  lists: () => [...districtKeys.all, 'list'] as const,
};

export function useDistrictsList() {
  return useQuery({
    queryKey: districtKeys.lists(),
    queryFn: () => districtService.list().then((r) => r.data),
  });
}

export function useCreateDistrict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDistrictReq) =>
      districtService.createDistrict(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: districtKeys.all });
    },
  });
}

export function useUpdateDistrict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDistrictReq }) =>
      districtService.updateDistrict(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: districtKeys.all });
    },
  });
}

export function useDeleteDistrict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => districtService.deleteDistrict(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: districtKeys.all });
    },
  });
}
