// ============================================================
// API Types — auto-derived from swagger.json definitions
// ============================================================

// ── Enums ───────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'admin' | 'district_admin' | 'auditor';

export type ApplicationStatus =
  | 'draft'
  | 'pending_admin'
  | 'pending_superadmin'
  | 'signed'
  | 'rejected'
  | 'clarification_needed'
  | 'watering_in_progress'
  | 'completed';


export type WaterMethod =
  | 'tanker'
  | 'drip'
  | 'stationary'
  | 'well'
  | 'mobile_pump'
  | 'manual';

export type ReviewAction = 'approve' | 'reject' | 'clarify';

export type SignAction = 'approve' | 'reject';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'sign'
  | 'login'
  | 'inspect'
  | 'export';

export type DayInterval = 30 | 60 | 90;

// ── Generic Envelope ────────────────────────────────────────

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface ApiListEnvelope<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ── Auth ────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  user: User;
}

export type LoginResponseEnvelope = ApiEnvelope<LoginResponseData>;

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponseData {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export type RefreshResponseEnvelope = ApiEnvelope<RefreshResponseData>;

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// ── User ────────────────────────────────────────────────────

export interface User {
  id: string;
  full_name: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  district_id: string | null;
  last_login_at: string | null;
  created_at: string;
}

export type UserEnvelope = ApiEnvelope<User>;

export interface RegisterRequest {
  full_name: string;
  username: string;
  password: string;
  role: UserRole;
  district_id?: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

export type UserListEnvelope = ApiListEnvelope<User>;

export interface UpdateUserReq {
  full_name?: string;
  username?: string;
  role?: UserRole;
  is_active?: boolean;
  district_id?: string | null;
}

// ── District ────────────────────────────────────────────────

export interface District {
  id: string;
  name: string;
  code: string;
  region: string;
  budget: number;
  is_active: boolean;
}

export interface CreateDistrictReq {
  code: string;
  name: string;
  budget?: number;
  is_active?: boolean;
  region?: string;
}

export interface UpdateDistrictReq {
  budget?: number;
  code?: string;
  is_active?: boolean;
  name?: string;
  region?: string;
}

export type DistrictEnvelope = ApiEnvelope<District>;
export type DistrictListEnvelope = ApiEnvelope<District[]>;

export interface DistrictListParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ── Sapling Type ────────────────────────────────────────────
//
// Mirrors backend `models.SaplingType`. `water_require_ltr` is
// the *per-sapling, per-watering* requirement and is what drives
// the "Estimated water need" hint in the application form.

export interface SaplingType {
  id: string;
  name: string;
  scientific_name?: string;
  water_require_ltr: number;
  growth_days?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Photos ──────────────────────────────────────────────────
//
// Field names mirror the Go backend models
// (internal/models/models.go: ApplicationPhoto, WateringPhoto).
// Note the backend stores `file_path` (a server path returned by
// the upload handler) — the frontend resolves it to a full URL
// via `resolvePhotoUrl()` in `shared/lib/photo-url.ts`.

export type ApplicationPhotoType = 'initial' | 'day30' | 'day60' | 'day90';

export interface ApplicationPhoto {
  id: string;
  application_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  photo_type: ApplicationPhotoType;
  uploaded_by_id: string;
  uploaded_by?: User | null;
  created_at: string;
  updated_at: string;
}

export interface WateringPhoto {
  id: string;
  watering_task_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by_id: string;
  uploaded_by?: User | null;
  created_at: string;
  updated_at: string;
}

// ── Application ─────────────────────────────────────────────

export interface Application {
  id: string;
  application_no: string;
  district_id: string;
  sapling_type_id: string;
  section: string;
  quantity: number;
  planting_date: string;
  water_method: WaterMethod;
  status: ApplicationStatus;
  notes: string | null;
  admin_notes: string | null;
  reject_reason: string | null;
  digital_signature: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  approved_at: string | null;
  district: District;
  sapling_type?: SaplingType | null;
  created_at: string;
  photos?: ApplicationPhoto[];
}

export type ApplicationEnvelope = ApiEnvelope<Application>;
export type ApplicationListEnvelope = ApiListEnvelope<Application>;

export interface CreateApplicationRequest {
  district_id: string;
  sapling_type_id: string;
  section: string;
  gps_latitude: number;
  gps_longitude: number;
  gps_address?: string;
  quantity: number;
  planting_date: string;
  water_method: WaterMethod;
  notes?: string;
  estimated_cost?: number;
}

export interface UpdateApplicationRequest {
  section?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  gps_address?: string;
  quantity?: number;
  planting_date?: string;
  water_method?: WaterMethod;
  notes?: string;
  estimated_cost?: number;
}

export interface ApplicationListParams {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  district_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// ── Review / Sign ───────────────────────────────────────────

export interface ReviewRequest {
  action: ReviewAction;
  admin_notes?: string;
  reject_reason?: string;
}

export interface SignRequest {
  action: SignAction;
  signature_secret: string;
  reject_reason?: string;
}

// ── Watering Tasks ──────────────────────────────────────────

export interface WateringTask {
  id: string;
  application_id: string;
  day_interval: DayInterval;
  scheduled_date: string;
  is_completed: boolean;
  completed_at: string | null;
  total_saplings: number;
  alive_saplings: number | null;
  survival_rate: number | null;
  water_used_ltr: number | null;
  watering_cost: number | null;
  notes: string | null;
  photos?: WateringPhoto[];
}

export type WateringTaskListEnvelope = ApiEnvelope<WateringTask[]>;

export interface CompleteWateringRequest {
  alive_saplings: number;
  water_used_ltr: number;
  watering_cost?: number;
  notes?: string;
}

// ── Inspections ─────────────────────────────────────────────

export interface InspectionRequest {
  survival_rate_ok?: boolean;
  irrigation_ok?: boolean;
  findings: string;
  recommendations?: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface Inspection {
  id: string;
  application_id: string;
  auditor_id: string;
  survival_rate_ok: boolean;
  irrigation_ok: boolean;
  findings: string;
  recommendations: string | null;
  rating: number;
  created_at: string;
}

export type InspectionListEnvelope = ApiEnvelope<Inspection[]>;

export interface InspectionWithRelations extends Inspection {
  auditor?: User | null;
  application?: { id: string; application_no: string } | null;
}

export interface InspectionListParams {
  page?: number;
  limit?: number;
}

export type InspectionPageEnvelope = ApiListEnvelope<InspectionWithRelations>;

// ── Analytics ───────────────────────────────────────────────

export interface DistrictStats {
  district_id: string;
  district_name: string;
  total_apps: number;
  approved_apps: number;
  completed_apps: number;
  total_saplings: number;
  total_cost: number;
  avg_survival_rate: number;
}

export type DistrictStatsEnvelope = ApiEnvelope<DistrictStats[]>;

export interface DistrictStatsParams {
  district_id?: string;
}

// ── Audit Logs ──────────────────────────────────────────────

export interface AuditLog {
  id: string;
  user_id: string;
  application_id?: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id?: string | null;
  description: string;
  old_value?: string | null;
  new_value?: string | null;
  ip_address: string;
  user_agent?: string;
  created_at: string;
  updated_at?: string;
  user?: User | null;
}

export type AuditLogListEnvelope = ApiListEnvelope<AuditLog>;

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  user_id?: string;
  application_id?: string;
  action?: AuditAction;
  date_from?: string;
  date_to?: string;
}
