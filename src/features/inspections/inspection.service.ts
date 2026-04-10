import { api } from '@/shared/api/axios.instance';
import type {
  InspectionPageEnvelope,
  InspectionListParams,
} from '@/shared/types/api.types';

export const inspectionService = {
  list: (params?: InspectionListParams) =>
    api.get<InspectionPageEnvelope>('/inspections', { params }),
};
