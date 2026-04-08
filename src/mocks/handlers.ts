import { http, HttpResponse, delay } from 'msw';
import {
  users,
  userList,
  PASSWORD,
  applications,
  addApplication,
  wateringTasks,
  inspections,
  auditLogs,
  districtStats,
  districts,
  saplingTypes,
} from './data';
import type {
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  CreateApplicationRequest,
  UpdateApplicationStatusRequest,
  ReviewRequest,
  SignRequest,
  CompleteWateringRequest,
  InspectionRequest,
  ApplicationStatus,
  Application,
  Inspection,
  User,
  UserRole,
  WateringTask,
} from '@/shared/types/api.types';

// ── Helpers ─────────────────────────────────────────────────

const BASE = '/api/v1';

// ── Token-encoded identity ──────────────────────────────────
//
// The bearer token IS the identity. Format:
//   mock.<username>.<kind>.<issued_at>
//
// This makes `tokenStorage` (localStorage) the single source of
// truth for "who is logged in". No mock-side mutable state, no
// shared key with the auth store, and refresh naturally
// preserves identity across reloads, new tabs, and 401-retry.
// ─────────────────────────────────────────────────────────────

function makeTokens(username: string) {
  const stamp = Date.now();
  return {
    access_token: `mock.${username}.access.${stamp}`,
    refresh_token: `mock.${username}.refresh.${stamp}`,
  };
}

function userFromToken(token: string | null | undefined): User | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 4 || parts[0] !== 'mock') return null;
  const username = parts[1];
  return Object.values(users).find((u) => u.username === username) ?? null;
}

function getUserFromAuth(request: Request): User | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return userFromToken(auth.slice('Bearer '.length));
}

function paginate<T>(items: T[], page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: {
      page,
      limit,
      total: items.length,
      total_pages: Math.ceil(items.length / limit),
    },
  };
}

// ── Auth handlers ───────────────────────────────────────────

const authHandlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as LoginRequest;
    const user = Object.values(users).find((u) => u.username === body.username);

    if (!user || body.password !== PASSWORD) {
      return HttpResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const tokens = makeTokens(user.username);

    return HttpResponse.json({
      success: true,
      data: {
        ...tokens,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        user,
      },
    });
  }),

  http.post(`${BASE}/auth/refresh`, async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as RefreshRequest;
    const user = userFromToken(body.refresh_token);
    if (!user) {
      return HttpResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      success: true,
      data: {
        ...makeTokens(user.username),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      },
    });
  }),

  http.get(`${BASE}/auth/me`, async ({ request }) => {
    await delay(200);
    const user = getUserFromAuth(request);
    if (!user) {
      return HttpResponse.json({ success: false }, { status: 401 });
    }
    return HttpResponse.json({ success: true, data: user });
  }),

  http.put(`${BASE}/auth/change-password`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, message: 'Password changed' });
  }),
];

// ── Application handlers ────────────────────────────────────

const applicationHandlers = [
  http.get(`${BASE}/applications`, async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status') as ApplicationStatus | null;
    const search = url.searchParams.get('search')?.toLowerCase();

    let filtered = [...applications];

    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.application_no.toLowerCase().includes(search) ||
          a.section.toLowerCase().includes(search) ||
          a.district.name.toLowerCase().includes(search),
      );
    }

    const result = paginate(filtered, page, limit);
    return HttpResponse.json({ success: true, ...result });
  }),

  http.get(`${BASE}/applications/:id`, async ({ params }) => {
    await delay(200);
    const app = applications.find((a) => a.id === params.id);
    if (!app) {
      return HttpResponse.json(
        { success: false, message: 'Not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: app });
  }),

  http.post(`${BASE}/applications`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as CreateApplicationRequest;
    const district = districts.find((d) => d.id === body.district_id) ?? districts[0];

    const newApp: Application = {
      id: crypto.randomUUID(),
      application_no: `APP-${new Date().getFullYear()}-${String(applications.length + 1).padStart(6, '0')}`,
      district_id: body.district_id,
      section: body.section,
      quantity: body.quantity,
      planting_date: body.planting_date,
      water_method: body.water_method,
      status: 'draft',
      notes: body.notes ?? null,
      admin_notes: null,
      reject_reason: null,
      digital_signature: null,
      estimated_cost: body.estimated_cost ?? null,
      actual_cost: null,
      approved_at: null,
      district,
      created_at: new Date().toISOString(),
    };

    addApplication(newApp);
    return HttpResponse.json({ success: true, data: newApp }, { status: 201 });
  }),

  http.put(`${BASE}/applications/:id`, async ({ params, request }) => {
    await delay(200);
    const app = applications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ success: false }, { status: 404 });

    const body = (await request.json()) as Partial<Application>;
    Object.assign(app, body);
    return HttpResponse.json({ success: true, data: app });
  }),

  http.delete(`${BASE}/applications/:id`, async ({ params }) => {
    await delay(200);
    const idx = applications.findIndex((a) => a.id === params.id);
    if (idx === -1) return HttpResponse.json({ success: false }, { status: 404 });
    applications.splice(idx, 1);
    return HttpResponse.json({ success: true, message: 'Deleted' });
  }),

  // ── Unified workflow transition ───────────────────────────
  //
  // PATCH /applications/:id/status
  //
  // Single endpoint for every status change. The user is derived
  // from the bearer token (see getUserFromAuth) and the requested
  // (from → to) transition is checked against ALLOWED_TRANSITIONS.
  // Returns 401 if no token, 403 if the role isn't allowed to make
  // this transition, 404 if the application is missing, 409 if the
  // transition is invalid from the current status.
  http.patch(`${BASE}/applications/:id/status`, async ({ params, request }) => {
    await delay(300);

    const user = getUserFromAuth(request);
    if (!user) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const app = applications.find((a) => a.id === params.id);
    if (!app) {
      return HttpResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 },
      );
    }

    const body = (await request.json()) as UpdateApplicationStatusRequest;
    const allowed = ALLOWED_TRANSITIONS[app.status] ?? [];
    const fromHere = allowed.find((t) => t.to === body.status);

    if (!fromHere) {
      return HttpResponse.json(
        {
          success: false,
          message: `Invalid transition: ${app.status} → ${body.status}`,
        },
        { status: 409 },
      );
    }

    if (fromHere.role !== user.role) {
      return HttpResponse.json(
        {
          success: false,
          message: `Forbidden: role '${user.role}' cannot perform ${app.status} → ${body.status}`,
        },
        { status: 403 },
      );
    }

    if (body.status === 'rejected' && !body.reason) {
      return HttpResponse.json(
        { success: false, message: 'reason is required when rejecting' },
        { status: 400 },
      );
    }

    applyTransition(app, body);
    return HttpResponse.json({ success: true, data: app });
  }),

  // ── POST /applications/:id/review  (Admin) ─────────────────
  //
  // Swagger-compliant endpoint. Body: ReviewRequest
  //   action === 'approve'  → pending_admin → pending_super_admin
  //   action === 'clarify'  → pending_admin → clarification_needed
  //   action === 'reject'   → pending_admin → rejected
  http.post(`${BASE}/applications/:id/review`, async ({ params, request }) => {
    await delay(300);

    const user = getUserFromAuth(request);
    if (!user) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }
    if (user.role !== 'admin') {
      return HttpResponse.json(
        {
          success: false,
          message: `Forbidden: role '${user.role}' cannot review applications`,
        },
        { status: 403 },
      );
    }

    const app = applications.find((a) => a.id === params.id);
    if (!app) {
      return HttpResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 },
      );
    }
    if (app.status !== 'pending_admin') {
      return HttpResponse.json(
        {
          success: false,
          message: `Cannot review an application in status '${app.status}'`,
        },
        { status: 409 },
      );
    }

    const body = (await request.json()) as ReviewRequest;
    if (body.action === 'reject' && !body.reject_reason) {
      return HttpResponse.json(
        { success: false, message: 'reject_reason is required when rejecting' },
        { status: 400 },
      );
    }

    switch (body.action) {
      case 'approve':
        applyTransition(app, {
          status: 'pending_super_admin',
          notes: body.admin_notes,
        });
        break;
      case 'clarify':
        applyTransition(app, {
          status: 'clarification_needed',
          notes: body.admin_notes,
        });
        break;
      case 'reject':
        applyTransition(app, {
          status: 'rejected',
          reason: body.reject_reason,
        });
        break;
      default:
        return HttpResponse.json(
          { success: false, message: `Unknown action '${body.action}'` },
          { status: 400 },
        );
    }

    return HttpResponse.json({ success: true, data: app });
  }),

  // ── POST /applications/:id/sign  (Super Admin) ─────────────
  //
  // Swagger-compliant endpoint. Body: SignRequest
  //   action === 'approve' + signature_secret → signed
  //   action === 'reject'                     → rejected
  http.post(`${BASE}/applications/:id/sign`, async ({ params, request }) => {
    await delay(300);

    const user = getUserFromAuth(request);
    if (!user) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }
    if (user.role !== 'super_admin') {
      return HttpResponse.json(
        {
          success: false,
          message: `Forbidden: role '${user.role}' cannot sign applications`,
        },
        { status: 403 },
      );
    }

    const app = applications.find((a) => a.id === params.id);
    if (!app) {
      return HttpResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 },
      );
    }
    if (app.status !== 'pending_super_admin') {
      return HttpResponse.json(
        {
          success: false,
          message: `Cannot sign an application in status '${app.status}'`,
        },
        { status: 409 },
      );
    }

    const body = (await request.json()) as SignRequest;

    if (body.action === 'approve') {
      // signature_secret is REQUIRED by Swagger for approvals.
      if (!body.signature_secret || body.signature_secret.trim().length < 4) {
        return HttpResponse.json(
          {
            success: false,
            message: 'signature_secret is required (min 4 chars)',
          },
          { status: 400 },
        );
      }
      applyTransition(app, { status: 'signed' });
    } else if (body.action === 'reject') {
      if (!body.reject_reason) {
        return HttpResponse.json(
          { success: false, message: 'reject_reason is required when rejecting' },
          { status: 400 },
        );
      }
      applyTransition(app, {
        status: 'rejected',
        reason: body.reject_reason,
      });
    } else {
      return HttpResponse.json(
        { success: false, message: `Unknown action '${body.action}'` },
        { status: 400 },
      );
    }

    return HttpResponse.json({ success: true, data: app });
  }),
];

// ── Workflow rules ──────────────────────────────────────────
//
// (current status) → list of (allowed next status, role that may
// perform it). Anything not listed is rejected with 409.

interface TransitionRule {
  to: ApplicationStatus;
  role: UserRole;
}

const ALLOWED_TRANSITIONS: Partial<Record<ApplicationStatus, TransitionRule[]>> = {
  draft: [
    { to: 'pending_admin', role: 'district_admin' },
  ],
  clarification_needed: [
    { to: 'pending_admin', role: 'district_admin' },
  ],
  pending_admin: [
    { to: 'pending_super_admin', role: 'admin' },
    { to: 'clarification_needed', role: 'admin' },
    { to: 'rejected', role: 'admin' },
  ],
  pending_super_admin: [
    { to: 'signed', role: 'super_admin' },
    { to: 'rejected', role: 'super_admin' },
  ],
  // signed / rejected / watering_in_progress / completed are terminal
  // for the approval workflow. Watering progression is owned by
  // /watering-tasks/:id/complete, not this endpoint.
};

function applyTransition(
  app: Application,
  body: UpdateApplicationStatusRequest,
): void {
  app.status = body.status;

  switch (body.status) {
    case 'pending_admin':
      // resubmission after clarification — clear stale notes
      if (body.notes) app.notes = body.notes;
      break;

    case 'pending_super_admin':
      app.admin_notes = body.notes ?? 'Approved by admin';
      break;

    case 'clarification_needed':
      app.admin_notes = body.notes ?? 'Clarification requested';
      break;

    case 'rejected':
      app.reject_reason = body.reason ?? 'Rejected';
      break;

    case 'signed':
      app.digital_signature = `sha256:${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`;
      app.approved_at = new Date().toISOString();
      // Auto-create watering tasks for the post-signing flow.
      [30, 60, 90].forEach((day) => {
        const scheduled = new Date();
        scheduled.setDate(scheduled.getDate() + day);
        const task: WateringTask = {
          id: crypto.randomUUID(),
          application_id: app.id,
          day_interval: day as 30 | 60 | 90,
          scheduled_date: scheduled.toISOString(),
          is_completed: false,
          completed_at: null,
          total_saplings: app.quantity,
          alive_saplings: null,
          survival_rate: null,
          water_used_ltr: null,
          watering_cost: null,
          notes: null,
        };
        wateringTasks.push(task);
      });
      break;
  }
}

// ── Watering handlers ───────────────────────────────────────

const wateringHandlers = [
  http.get(`${BASE}/applications/:id/watering-tasks`, async ({ params }) => {
    await delay(200);
    const tasks = wateringTasks.filter((t) => t.application_id === params.id);
    return HttpResponse.json({ success: true, data: tasks });
  }),

  http.post(`${BASE}/watering-tasks/:taskId/complete`, async ({ params, request }) => {
    await delay(300);
    const task = wateringTasks.find((t) => t.id === params.taskId);
    if (!task) return HttpResponse.json({ success: false }, { status: 404 });

    const body = (await request.json()) as CompleteWateringRequest;
    task.is_completed = true;
    task.completed_at = new Date().toISOString();
    task.alive_saplings = body.alive_saplings;
    task.water_used_ltr = body.water_used_ltr;
    task.watering_cost = body.watering_cost ?? null;
    task.notes = body.notes ?? null;
    task.survival_rate =
      task.total_saplings > 0
        ? (body.alive_saplings / task.total_saplings) * 100
        : 0;

    // Check if all 3 tasks for the application are completed
    const appTasks = wateringTasks.filter(
      (t) => t.application_id === task.application_id,
    );
    if (appTasks.every((t) => t.is_completed)) {
      const app = applications.find((a) => a.id === task.application_id);
      if (app) app.status = 'completed';
    }

    return HttpResponse.json({ success: true, data: task });
  }),
];

// ── Inspection handlers ─────────────────────────────────────

const inspectionHandlers = [
  http.get(`${BASE}/applications/:id/inspections`, async ({ params }) => {
    await delay(200);
    const list = inspections.filter((i) => i.application_id === params.id);
    return HttpResponse.json({ success: true, data: list });
  }),

  http.post(`${BASE}/applications/:id/inspections`, async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as InspectionRequest;
    const auditor = getUserFromAuth(request) ?? users.auditor;
    const newInsp: Inspection = {
      id: crypto.randomUUID(),
      application_id: params.id as string,
      auditor_id: auditor.id,
      survival_rate_ok: body.survival_rate_ok ?? false,
      irrigation_ok: body.irrigation_ok ?? false,
      findings: body.findings,
      recommendations: body.recommendations ?? null,
      rating: body.rating,
      created_at: new Date().toISOString(),
    };
    inspections.push(newInsp);
    return HttpResponse.json({ success: true, data: newInsp }, { status: 201 });
  }),
];

// ── Analytics handlers ──────────────────────────────────────

const analyticsHandlers = [
  http.get(`${BASE}/analytics/districts`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const districtId = url.searchParams.get('district_id');

    const data = districtId
      ? districtStats.filter((d) => d.district_id === districtId)
      : districtStats;

    return HttpResponse.json({ success: true, data });
  }),
];

// ── Audit log handlers ──────────────────────────────────────

const auditHandlers = [
  http.get(`${BASE}/audit-logs`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '20');
    const result = paginate(auditLogs, page, limit);
    return HttpResponse.json({ success: true, ...result });
  }),

  http.get(`${BASE}/audit-logs/application/:id`, async ({ params }) => {
    await delay(200);
    const logs = auditLogs.filter((l) => l.application_id === params.id);
    return HttpResponse.json({ success: true, data: logs });
  }),
];

// ── Users handlers ──────────────────────────────────────────
//
// Role hierarchy for POST /users:
//   super_admin → can create ANY role
//   admin       → can create district_admin or auditor only
//   others      → forbidden
//
// `district_id` is required when role === 'district_admin' and
// rejected (ignored) otherwise.

const CREATABLE_BY: Partial<Record<UserRole, UserRole[]>> = {
  super_admin: ['super_admin', 'admin', 'district_admin', 'auditor'],
  admin: ['district_admin', 'auditor'],
};

const userHandlers = [
  http.get(`${BASE}/users`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '20');
    const role = url.searchParams.get('role') as UserRole | null;
    const search = url.searchParams.get('search')?.toLowerCase().trim();

    let filtered = userList.slice();
    if (role) filtered = filtered.filter((u) => u.role === role);
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.full_name.toLowerCase().includes(search) ||
          u.username.toLowerCase().includes(search),
      );
    }

    const result = paginate(filtered, page, limit);
    return HttpResponse.json({ success: true, ...result });
  }),

  http.post(`${BASE}/users`, async ({ request }) => {
    await delay(300);

    const actor = getUserFromAuth(request);
    if (!actor) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const allowedRoles = CREATABLE_BY[actor.role];
    if (!allowedRoles) {
      return HttpResponse.json(
        {
          success: false,
          message: `Forbidden: role '${actor.role}' cannot create users`,
        },
        { status: 403 },
      );
    }

    const body = (await request.json()) as RegisterRequest;

    // Basic validation
    if (!body.full_name || !body.username || !body.password || !body.role) {
      return HttpResponse.json(
        { success: false, message: 'full_name, username, password, role are required' },
        { status: 400 },
      );
    }

    if (!allowedRoles.includes(body.role)) {
      return HttpResponse.json(
        {
          success: false,
          message: `Forbidden: '${actor.role}' cannot create a '${body.role}'`,
        },
        { status: 403 },
      );
    }

    if (body.role === 'district_admin' && !body.district_id) {
      return HttpResponse.json(
        { success: false, message: 'district_id is required for district_admin' },
        { status: 400 },
      );
    }

    if (userList.some((u) => u.username === body.username)) {
      return HttpResponse.json(
        { success: false, message: `Username '${body.username}' already exists` },
        { status: 409 },
      );
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      full_name: body.full_name,
      username: body.username,
      role: body.role,
      is_active: true,
      district_id: body.role === 'district_admin' ? body.district_id ?? null : null,
      last_login_at: null,
      created_at: new Date().toISOString(),
    };
    userList.push(newUser);

    return HttpResponse.json(
      { success: true, data: newUser },
      { status: 201 },
    );
  }),

  http.put(`${BASE}/users/:id/deactivate`, async ({ params, request }) => {
    await delay(300);

    const actor = getUserFromAuth(request);
    if (!actor) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Only super_admin can deactivate accounts.
    if (actor.role !== 'super_admin') {
      return HttpResponse.json(
        {
          success: false,
          message: `Forbidden: role '${actor.role}' cannot deactivate users`,
        },
        { status: 403 },
      );
    }

    const target = userList.find((u) => u.id === params.id);
    if (!target) {
      return HttpResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    if (target.id === actor.id) {
      return HttpResponse.json(
        { success: false, message: 'Cannot deactivate your own account' },
        { status: 400 },
      );
    }

    target.is_active = false;
    return HttpResponse.json({ success: true, data: target });
  }),
];

// ── Lookup handlers (districts, sapling types) ─────────────

const lookupHandlers = [
  http.get(`${BASE}/districts`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: districts });
  }),

  http.get(`${BASE}/sapling-types`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: saplingTypes });
  }),
];

// ── Export all ───────────────────────────────────────────────

export const handlers = [
  ...authHandlers,
  ...applicationHandlers,
  ...wateringHandlers,
  ...inspectionHandlers,
  ...analyticsHandlers,
  ...auditHandlers,
  ...userHandlers,
  ...lookupHandlers,
];
