# Ozelenenie — Tree Planting & Irrigation Tracking System

A role-based web application for managing tree planting applications, irrigation monitoring, and government audit compliance.

## Tech Stack

- **React 19** (Vite) + TypeScript
- **Tailwind CSS v4** + **Shadcn UI**
- **React Router v7** (createBrowserRouter)
- **TanStack Query** + Axios (with JWT mutex refresh)
- **Zustand** (auth state) + **React Hook Form** + Zod v4
- **Recharts** (dashboard analytics)
- **Leaflet** / react-leaflet (GPS map)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Configure environment
cp .env.example .env
# Edit .env if you need to point to a different API

# 3. Start dev server
npm run dev
```

The dev server starts at `http://localhost:5173`. The Vite proxy forwards `/api/*` requests to the backend at `https://duk-backend.onrender.com`.

## Environment Variables

| Variable       | Description                                       | Default                            |
| -------------- | ------------------------------------------------- | ---------------------------------- |
| `VITE_API_URL` | API origin. Leave empty to use Vite's dev proxy.  | _(empty — proxy to render.com)_    |

For production builds, set `VITE_API_URL` to the backend origin (e.g. `https://duk-backend.onrender.com`).

## Production Build

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```

## Role-Based Access

The system has four roles with different permissions:

| Role              | Capabilities                                                                 |
| ----------------- | ---------------------------------------------------------------------------- |
| **super_admin**   | Full access. Sign/approve applications (digital signature). View audit logs. |
| **admin**         | Review applications (approve / reject / request clarification). Manage users.|
| **district_admin**| Create & submit applications. Complete watering tasks (30/60/90 day).        |
| **auditor**       | Inspect applications. Record findings, ratings, and recommendations.         |

### Test Credentials

| Role            | Username       | Password         |
| --------------- | -------------- | ---------------- |
| Super Admin     | `superadmin`   | `superadmin123`  |

> Additional test accounts can be created via the Users page (admin+ roles).

## Project Structure

```
src/
├── app/                    # App root: providers, router config
│   ├── providers/          # QueryClient, Toaster, AuthGate
│   └── routes/             # AppRouter, ProtectedRoute (RBAC)
├── shared/                 # Shared layer
│   ├── api/                # Axios instance + JWT mutex interceptor
│   ├── lib/                # Token storage utility
│   └── types/              # TypeScript interfaces (from swagger.json)
├── features/               # Domain feature modules
│   ├── auth/               # Auth service, Zustand store, hooks
│   ├── applications/       # CRUD service, hooks, components
│   │   ├── components/     # CreateModal, WateringTasks, Map, AuditHistory
│   │   ├── hooks/          # useApplications, useWateringTasks, useAuditHistory
│   │   └── lib/            # Status badge utilities
│   ├── dashboard/          # Analytics service + hooks
│   ├── inspections/        # Inspection hooks + modal + list
│   └── users/              # User service
├── pages/                  # Route-level page components
│   ├── auth/               # LoginPage, UnauthorizedPage
│   ├── dashboard/          # DashboardPage (KPI cards + charts)
│   └── applications/       # List, Detail (tabbed: details/watering/inspections/map/audit)
├── layouts/                # MainLayout with role-filtered sidebar
├── components/ui/          # Shadcn UI primitives
├── hooks/                  # Shadcn shared hooks
└── lib/                    # Shadcn utils
```

## API Configuration

The API base path is `/api/v1`. In development, Vite's proxy handles CORS by forwarding requests to the backend. In production, either:

- Deploy the frontend behind the same origin as the backend, or
- Set `VITE_API_URL` to the backend origin and ensure CORS is configured.

Swagger definition: see `swagger.json` in the project root.
