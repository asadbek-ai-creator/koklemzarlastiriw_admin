import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
// ── Lazy-loaded pages ───────────────────────────────────────
import { useAuthStore } from '@/features/auth/store/auth.store';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const UnauthorizedPage = lazy(() => import('@/pages/auth/UnauthorizedPage'));
const MainLayout = lazy(() => import('@/layouts/MainLayout'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ApplicationsPage = lazy(() => import('@/pages/applications/ApplicationsPage'));
const ApplicationDetailPage = lazy(() => import('@/pages/applications/ApplicationDetailPage'));
const DistrictPage = lazy(() => import('@/pages/district/DistrictPage'));
const UsersPage = lazy(() => import('@/pages/users/UsersPage'));
const AuditLogsPage = lazy(() => import('@/pages/audit/AuditLogsPage'));
const DistrictsPage = lazy(() => import('@/pages/districts/DistrictsPage'));
const InspectionsPage = lazy(() => import('@/pages/inspections/InspectionsPage'));

// ── Role-aware default redirect ─────────────────────────────
function DefaultRedirect() {
  const user = useAuthStore((s) => s.user);
  const target = user?.role === 'super_admin' ? '/dashboard' : '/applications';
  return <Navigate to={target} replace />;
}

// ── Fallback spinner ────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// ── Router definition ───────────────────────────────────────
const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/unauthorized',
    element: (
      <Suspense fallback={<PageLoader />}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <MainLayout />
          </Suspense>
        ),
        children: [
          {
            element: <ProtectedRoute allowedRoles={['super_admin']} />,
            children: [
              {
                path: '/dashboard',
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: '/applications',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ApplicationsPage />
              </Suspense>
            ),
          },
          {
            path: '/applications/:id',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ApplicationDetailPage />
              </Suspense>
            ),
          },

          // ── Role-guarded subtree (district_admin only) ──────
          // ProtectedRoute renders <Outlet />, so role-guarded
          // routes MUST be wired as a parent layout route — not
          // as `children` of an element prop.
          {
            element: <ProtectedRoute allowedRoles={['district_admin']} />,
            children: [
              {
                path: '/district',
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <DistrictPage />
                  </Suspense>
                ),
              },
            ],
          },

          // ── Role-guarded subtree (super_admin + admin) ──────
          {
            element: (
              <ProtectedRoute allowedRoles={['super_admin', 'admin']} />
            ),
            children: [
              {
                path: '/users',
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <UsersPage />
                  </Suspense>
                ),
              },
            ],
          },

          // ── Role-guarded subtree (super_admin + admin + auditor)
          {
            element: (
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'auditor']} />
            ),
            children: [
              {
                path: '/inspections',
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <InspectionsPage />
                  </Suspense>
                ),
              },
            ],
          },

          // ── Role-guarded subtree (super_admin only) ─────────
          {
            element: <ProtectedRoute allowedRoles={['super_admin']} />,
            children: [
              {
                path: '/districts',
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <DistrictsPage />
                  </Suspense>
                ),
              },
              {
                path: '/audit-logs',
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <AuditLogsPage />
                  </Suspense>
                ),
              },
            ],
          },
          
        ],
      },
    ],
  },
  {
    path: '*',
    element: <DefaultRedirect />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
