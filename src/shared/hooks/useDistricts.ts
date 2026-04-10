import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/axios.instance';
import { DEFAULT_DISTRICTS } from '@/shared/constants/default-districts';
import type { ApiEnvelope, District } from '@/shared/types/api.types';

export function useDistricts() {
  const query = useQuery({
    queryKey: ['districts'],
    queryFn: () =>
      api
        .get<ApiEnvelope<District[]>>('/districts')
        .then((r) => r.data.data),
  });

  const districts: District[] =
    query.data && query.data.length > 0
      ? query.data
      : query.isError || (query.isSuccess && query.data.length === 0)
        ? DEFAULT_DISTRICTS
        : [];

  return {
    ...query,
    districts,
    isFallback: districts === DEFAULT_DISTRICTS,
  };
}
