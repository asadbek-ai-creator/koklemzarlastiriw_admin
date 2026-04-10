import type { District } from '@/shared/types/api.types';

export const DEFAULT_DISTRICTS: District[] = [
  { id: 'd1000000-0000-4000-a000-000000000001', name: 'Chirchiq tumani',   code: 'CHR', region: 'Toshkent', budget: 500_000_000, is_active: true },
  { id: 'd1000000-0000-4000-a000-000000000002', name: 'Olmaliq tumani',    code: 'OLM', region: 'Toshkent', budget: 350_000_000, is_active: true },
  { id: 'd1000000-0000-4000-a000-000000000003', name: 'Angren tumani',     code: 'ANG', region: 'Toshkent', budget: 280_000_000, is_active: true },
  { id: 'd1000000-0000-4000-a000-000000000004', name: 'Bekobod tumani',    code: 'BEK', region: 'Toshkent', budget: 420_000_000, is_active: true },
  { id: 'd1000000-0000-4000-a000-000000000005', name: 'Zangiota tumani',   code: 'ZAN', region: 'Toshkent', budget: 310_000_000, is_active: true },
];
