import type {
  User,
  Application,
  DistrictStats,
  District,
  SaplingType,
  WateringTask,
  Inspection,
  AuditLog,
} from '@/shared/types/api.types';

// ── Districts ───────────────────────────────────────────────

export const districts: District[] = [
  { id: 'd1000000-0000-4000-a000-000000000001', name: 'Chirchiq tumani',   code: 'CHR', region: 'Toshkent', budget: 500_000_000, is_active: true },
  { id: 'd1000000-0000-4000-a000-000000000002', name: 'Olmaliq tumani',    code: 'OLM', region: 'Toshkent', budget: 350_000_000, is_active: true },
  { id: 'd1000000-0000-4000-a000-000000000003', name: 'Angren tumani',     code: 'ANG', region: 'Toshkent', budget: 280_000_000, is_active: true },
  { id: 'd1000000-0000-4000-a000-000000000004', name: 'Bekobod tumani',    code: 'BEK', region: 'Toshkent', budget: 420_000_000, is_active: true },
  { id: 'd1000000-0000-4000-a000-000000000005', name: 'Zangiota tumani',   code: 'ZAN', region: 'Toshkent', budget: 310_000_000, is_active: true },
];

// ── Sapling Types ──────────────────────────────────────────

export const saplingTypes: SaplingType[] = [
  { id: 'b1000000-0000-4000-a000-000000000001', name: 'Chinor (Platanus)',        category: 'Dekorativ',   is_active: true },
  { id: 'b1000000-0000-4000-a000-000000000002', name: 'Terak (Populus)',          category: 'Tezpishiq',   is_active: true },
  { id: 'b1000000-0000-4000-a000-000000000003', name: 'Tut (Morus)',             category: 'Mevali',      is_active: true },
  { id: 'b1000000-0000-4000-a000-000000000004', name: 'Archa (Juniperus)',       category: 'Doimiy yashil', is_active: true },
  { id: 'b1000000-0000-4000-a000-000000000005', name: "Olma (Malus)",            category: 'Mevali',      is_active: true },
  { id: 'b1000000-0000-4000-a000-000000000006', name: "O'rik (Prunus)",          category: 'Mevali',      is_active: true },
  { id: 'b1000000-0000-4000-a000-000000000007', name: 'Zarang (Fraxinus)',       category: 'Dekorativ',   is_active: true },
];

// ── Users (one per role) ────────────────────────────────────

export const users: Record<string, User> = {
  superadmin: {
    id: 'e0000000-0000-4000-a000-000000000001',
    full_name: 'Jasur Karimov',
    username: 'superadmin',
    role: 'super_admin',
    is_active: true,
    district_id: null,
    last_login_at: '2026-04-01T08:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
  },
  admin: {
    id: 'e0000000-0000-4000-a000-000000000002',
    full_name: 'Nilufar Rashidova',
    username: 'admin',
    role: 'admin',
    is_active: true,
    district_id: null,
    last_login_at: '2026-04-01T09:00:00Z',
    created_at: '2024-01-15T00:00:00Z',
  },
  district: {
    id: 'e0000000-0000-4000-a000-000000000003',
    full_name: 'Bobur Aliyev',
    username: 'district',
    role: 'district_admin',
    is_active: true,
    district_id: 'd1000000-0000-0000-0000-000000000001',
    last_login_at: '2026-04-01T07:30:00Z',
    created_at: '2024-02-01T00:00:00Z',
  },
  auditor: {
    id: 'e0000000-0000-4000-a000-000000000004',
    full_name: 'Malika Usmonova',
    username: 'auditor',
    role: 'auditor',
    is_active: true,
    district_id: null,
    last_login_at: '2026-04-01T10:00:00Z',
    created_at: '2024-03-01T00:00:00Z',
  },
};

// All passwords resolve to "password123"
export const PASSWORD = 'password123';

// Mutable list used by the /users handlers (list, create, deactivate).
// Seeded from the named `users` Record so the fixture accounts above
// remain addressable via `users.superadmin`, `users.auditor`, etc.
export const userList: User[] = Object.values(users);

// ── Applications ────────────────────────────────────────────

let appCounter = 7;

export const applications: Application[] = [
  {
    id: 'a0000000-0000-4000-a000-000000000001',
    application_no: 'APP-2026-000001',
    district_id: districts[0].id,
    section: '21-27km',
    quantity: 500,
    planting_date: '2026-03-15T00:00:00Z',
    water_method: 'drip',
    status: 'signed',
    notes: 'Bahorgi ekish mavsumi',
    admin_notes: 'Tasdiqlandi',
    reject_reason: null,
    digital_signature: 'sha256:a1b2c3d4e5f6...',
    estimated_cost: 2_500_000,
    actual_cost: 2_300_000,
    approved_at: '2026-03-10T14:00:00Z',
    district: districts[0],
    created_at: '2026-03-01T08:00:00Z',
  },
  {
    id: 'a0000000-0000-4000-a000-000000000002',
    application_no: 'APP-2026-000002',
    district_id: districts[1].id,
    section: '5-12km',
    quantity: 300,
    planting_date: '2026-03-20T00:00:00Z',
    water_method: 'tanker',
    status: 'pending_admin',
    notes: null,
    admin_notes: null,
    reject_reason: null,
    digital_signature: null,
    estimated_cost: 1_800_000,
    actual_cost: null,
    approved_at: null,
    district: districts[1],
    created_at: '2026-03-05T09:00:00Z',
  },
  {
    id: 'a0000000-0000-4000-a000-000000000003',
    application_no: 'APP-2026-000003',
    district_id: districts[2].id,
    section: '1-4km',
    quantity: 200,
    planting_date: '2026-04-01T00:00:00Z',
    water_method: 'well',
    status: 'draft',
    notes: "Ko'chatlar tayyorlanmoqda",
    admin_notes: null,
    reject_reason: null,
    digital_signature: null,
    estimated_cost: 1_200_000,
    actual_cost: null,
    approved_at: null,
    district: districts[2],
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'a0000000-0000-4000-a000-000000000004',
    application_no: 'APP-2026-000004',
    district_id: districts[0].id,
    section: '30-35km',
    quantity: 750,
    planting_date: '2026-03-25T00:00:00Z',
    water_method: 'stationary',
    status: 'watering_in_progress',
    notes: "Sug'orish boshlandi",
    admin_notes: null,
    reject_reason: null,
    digital_signature: 'sha256:f1e2d3c4b5a6...',
    estimated_cost: 4_500_000,
    actual_cost: 3_800_000,
    approved_at: '2026-03-18T12:00:00Z',
    district: districts[0],
    created_at: '2026-03-08T11:00:00Z',
  },
  {
    id: 'a0000000-0000-4000-a000-000000000005',
    application_no: 'APP-2026-000005',
    district_id: districts[3].id,
    section: '8-15km',
    quantity: 400,
    planting_date: '2026-03-28T00:00:00Z',
    water_method: 'mobile_pump',
    status: 'pending_super_admin',
    notes: null,
    admin_notes: 'Admin tomonidan tasdiqlangan',
    reject_reason: null,
    digital_signature: null,
    estimated_cost: 2_000_000,
    actual_cost: null,
    approved_at: null,
    district: districts[3],
    created_at: '2026-03-12T07:00:00Z',
  },
  {
    id: 'a0000000-0000-4000-a000-000000000006',
    application_no: 'APP-2026-000006',
    district_id: districts[4].id,
    section: '2-6km',
    quantity: 150,
    planting_date: '2026-04-05T00:00:00Z',
    water_method: 'manual',
    status: 'completed',
    notes: "Barcha ko'chatlar ekildi",
    admin_notes: null,
    reject_reason: null,
    digital_signature: 'sha256:d4e5f6a7b8c9...',
    estimated_cost: 900_000,
    actual_cost: 850_000,
    approved_at: '2026-03-20T15:00:00Z',
    district: districts[4],
    created_at: '2026-03-15T06:30:00Z',
  },
  {
    id: 'a0000000-0000-4000-a000-000000000007',
    application_no: 'APP-2026-000007',
    district_id: districts[2].id,
    section: '40-44km',
    quantity: 250,
    planting_date: '2026-04-10T00:00:00Z',
    water_method: 'tanker',
    status: 'rejected',
    notes: null,
    admin_notes: null,
    reject_reason: 'Insufficient budget justification',
    digital_signature: null,
    estimated_cost: 1_500_000,
    actual_cost: null,
    approved_at: null,
    district: districts[2],
    created_at: '2026-03-14T08:30:00Z',
  },
];

export function addApplication(app: Application) {
  appCounter++;
  app.application_no = `APP-2026-${String(appCounter).padStart(6, '0')}`;
  applications.unshift(app);
  return app;
}

// ── Watering Tasks ──────────────────────────────────────────

export const wateringTasks: WateringTask[] = [
  // For application 4 (watering_in_progress)
  {
    id: 'f0000000-0000-4000-a000-000000000001',
    application_id: 'a0000000-0000-4000-a000-000000000004',
    day_interval: 30,
    scheduled_date: '2026-04-17T00:00:00Z',
    is_completed: true,
    completed_at: '2026-04-17T14:00:00Z',
    total_saplings: 750,
    alive_saplings: 720,
    survival_rate: 96.0,
    water_used_ltr: 15000,
    watering_cost: 800_000,
    notes: "Ko'chatlar yaxshi o'smoqda",
  },
  {
    id: 'f0000000-0000-4000-a000-000000000002',
    application_id: 'a0000000-0000-4000-a000-000000000004',
    day_interval: 60,
    scheduled_date: '2026-05-17T00:00:00Z',
    is_completed: false,
    completed_at: null,
    total_saplings: 750,
    alive_saplings: null,
    survival_rate: null,
    water_used_ltr: null,
    watering_cost: null,
    notes: null,
  },
  {
    id: 'f0000000-0000-4000-a000-000000000003',
    application_id: 'a0000000-0000-4000-a000-000000000004',
    day_interval: 90,
    scheduled_date: '2026-06-16T00:00:00Z',
    is_completed: false,
    completed_at: null,
    total_saplings: 750,
    alive_saplings: null,
    survival_rate: null,
    water_used_ltr: null,
    watering_cost: null,
    notes: null,
  },
  // For application 6 (completed) — all 3 done
  {
    id: 'f0000000-0000-4000-a000-000000000004',
    application_id: 'a0000000-0000-4000-a000-000000000006',
    day_interval: 30,
    scheduled_date: '2026-04-19T00:00:00Z',
    is_completed: true,
    completed_at: '2026-04-19T10:00:00Z',
    total_saplings: 150,
    alive_saplings: 148,
    survival_rate: 98.7,
    water_used_ltr: 3000,
    watering_cost: 150_000,
    notes: null,
  },
  {
    id: 'f0000000-0000-4000-a000-000000000005',
    application_id: 'a0000000-0000-4000-a000-000000000006',
    day_interval: 60,
    scheduled_date: '2026-05-19T00:00:00Z',
    is_completed: true,
    completed_at: '2026-05-20T09:00:00Z',
    total_saplings: 150,
    alive_saplings: 145,
    survival_rate: 96.7,
    water_used_ltr: 2800,
    watering_cost: 140_000,
    notes: null,
  },
  {
    id: 'f0000000-0000-4000-a000-000000000006',
    application_id: 'a0000000-0000-4000-a000-000000000006',
    day_interval: 90,
    scheduled_date: '2026-06-18T00:00:00Z',
    is_completed: true,
    completed_at: '2026-06-18T11:00:00Z',
    total_saplings: 150,
    alive_saplings: 142,
    survival_rate: 94.7,
    water_used_ltr: 2500,
    watering_cost: 130_000,
    notes: "Barcha ko'chatlar sog'lom",
  },
];

// ── Inspections ─────────────────────────────────────────────

export const inspections: Inspection[] = [
  {
    id: '10000000-0000-4000-a000-000000000001',
    application_id: 'a0000000-0000-4000-a000-000000000001',
    auditor_id: users.auditor.id,
    survival_rate_ok: true,
    irrigation_ok: true,
    findings: "Ko'chatlarning 96% tirik. Sug'orish tizimi yaxshi ishlayapti.",
    recommendations: null,
    rating: 5,
    created_at: '2026-03-25T14:00:00Z',
  },
  {
    id: '10000000-0000-4000-a000-000000000002',
    application_id: 'a0000000-0000-4000-a000-000000000004',
    auditor_id: users.auditor.id,
    survival_rate_ok: true,
    irrigation_ok: false,
    findings: "Sug'orish tizimida kichik nosozlik aniqlandi. Ko'chatlar tirik.",
    recommendations: "Drip tizimini tekshirish kerak",
    rating: 3,
    created_at: '2026-04-20T10:30:00Z',
  },
];

// ── Audit Logs ──────────────────────────────────────────────

export const auditLogs: AuditLog[] = [
  {
    id: 'a1000000-0000-4000-a000-000000000001',
    user_id: users.district.id,
    application_id: 'a0000000-0000-4000-a000-000000000001',
    action: 'create',
    entity_type: 'application',
    description: 'Application APP-2026-000001 created by Bobur Aliyev',
    old_value: null,
    new_value: 'status: draft',
    ip_address: '192.168.1.10',
    created_at: '2026-03-01T08:00:00Z',
  },
  {
    id: 'a1000000-0000-4000-a000-000000000002',
    user_id: users.district.id,
    application_id: 'a0000000-0000-4000-a000-000000000001',
    action: 'update',
    entity_type: 'application',
    description: 'Application submitted for admin review',
    old_value: 'status: draft',
    new_value: 'status: pending_admin',
    ip_address: '192.168.1.10',
    created_at: '2026-03-02T09:00:00Z',
  },
  {
    id: 'a1000000-0000-4000-a000-000000000003',
    user_id: users.admin.id,
    application_id: 'a0000000-0000-4000-a000-000000000001',
    action: 'approve',
    entity_type: 'application',
    description: 'Admin approved — forwarded to SuperAdmin',
    old_value: 'status: pending_admin',
    new_value: 'status: pending_super_admin',
    ip_address: '192.168.1.20',
    created_at: '2026-03-05T11:00:00Z',
  },
  {
    id: 'a1000000-0000-4000-a000-000000000004',
    user_id: users.superadmin.id,
    application_id: 'a0000000-0000-4000-a000-000000000001',
    action: 'sign',
    entity_type: 'application',
    description: 'SuperAdmin signed with digital signature',
    old_value: 'status: pending_super_admin',
    new_value: 'status: signed',
    ip_address: '192.168.1.1',
    created_at: '2026-03-10T14:00:00Z',
  },
  {
    id: 'a1000000-0000-4000-a000-000000000005',
    user_id: users.auditor.id,
    application_id: 'a0000000-0000-4000-a000-000000000001',
    action: 'inspect',
    entity_type: 'inspection',
    description: 'Auditor inspection completed — rating 5/5',
    old_value: null,
    new_value: 'rating: 5, survival_rate_ok: true',
    ip_address: '192.168.1.30',
    created_at: '2026-03-25T14:00:00Z',
  },
];

// ── District Stats ──────────────────────────────────────────

export const districtStats: DistrictStats[] = [
  { district_id: districts[0].id, district_name: 'Chirchiq tumani',  total_apps: 42, approved_apps: 38, completed_apps: 20, total_saplings: 21000, total_cost: 48_500_000, avg_survival_rate: 94.7 },
  { district_id: districts[1].id, district_name: 'Olmaliq tumani',   total_apps: 28, approved_apps: 25, completed_apps: 15, total_saplings: 14000, total_cost: 32_000_000, avg_survival_rate: 91.2 },
  { district_id: districts[2].id, district_name: 'Angren tumani',    total_apps: 19, approved_apps: 16, completed_apps: 10, total_saplings: 9500,  total_cost: 21_000_000, avg_survival_rate: 88.5 },
  { district_id: districts[3].id, district_name: 'Bekobod tumani',   total_apps: 35, approved_apps: 30, completed_apps: 18, total_saplings: 17500, total_cost: 40_000_000, avg_survival_rate: 92.3 },
  { district_id: districts[4].id, district_name: 'Zangiota tumani',  total_apps: 22, approved_apps: 20, completed_apps: 12, total_saplings: 11000, total_cost: 25_000_000, avg_survival_rate: 96.1 },
];
