import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/features/applications/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  useApplication,
  useUpdateApplicationStatus,
  useReviewApplication,
  useSignApplication,
} from '@/features/applications/hooks/useApplications';
import { useAuthStore } from '@/features/auth/store/auth.store';

import { WateringTasks } from '@/features/applications/components/WateringTasks';
import { ApplicationMap } from '@/features/applications/components/ApplicationMap';
import { AuditHistory } from '@/features/applications/components/AuditHistory';
import { RejectModal } from '@/features/applications/components/RejectModal';
import { ClarifyModal } from '@/features/applications/components/ClarifyModal';
import { SignDocumentModal } from '@/features/applications/components/SignDocumentModal';
import { InspectionsList } from '@/features/inspections/components/InspectionsList';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useApplication(id!);
  const app = data?.data;

  // ── Workflow mutations ────────────────────────────────────
  //
  // Three distinct endpoints:
  //   - PATCH /status  → district_admin "submit" (draft → pending_admin
  //     and clarification_needed → pending_admin). Used via
  //     useUpdateApplicationStatus.
  //   - POST  /review  → admin approve/clarify/reject.
  //   - POST  /sign    → super_admin approve (with signature_secret) /
  //     reject.
  const statusMutation = useUpdateApplicationStatus();
  const reviewMutation = useReviewApplication();
  const signMutation = useSignApplication();

  const actionPending =
    statusMutation.isPending ||
    reviewMutation.isPending ||
    signMutation.isPending;

  // ── Modal open state ──────────────────────────────────────
  const [rejectOpen, setRejectOpen] = useState(false);
  const [clarifyOpen, setClarifyOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);

  // ── Shared error toast helper ─────────────────────────────
  const toastError = (fallback: string) => (err: unknown) => {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? fallback;
    toast.error(message);
  };

  // ── District admin: submit or resubmit to admin ───────────
  const handleSubmitToAdmin = () => {
    statusMutation.mutate(
      { id: id!, status: 'pending_admin' },
      {
        onSuccess: () => toast.success('Submitted to admin for review'),
        onError: toastError('Failed to submit application'),
      },
    );
  };

  // ── Admin: approve via POST /review ───────────────────────
  const handleApproveAsAdmin = () => {
    reviewMutation.mutate(
      { id: id!, action: 'approve', admin_notes: 'Approved by admin' },
      {
        onSuccess: () => toast.success('Forwarded to Super Admin'),
        onError: toastError('Failed to approve application'),
      },
    );
  };

  // ── Admin: request clarification via POST /review ─────────
  const handleRequestClarification = (admin_notes: string) => {
    reviewMutation.mutate(
      { id: id!, action: 'clarify', admin_notes },
      {
        onSuccess: () => {
          toast.success('Clarification requested');
          setClarifyOpen(false);
        },
        onError: toastError('Failed to request clarification'),
      },
    );
  };

  // ── Admin OR Super Admin: reject ──────────────────────────
  //
  // Dispatches to the correct endpoint based on current state:
  //   pending_admin        → POST /review  (action: reject)
  //   pending_super_admin  → POST /sign    (action: reject)
  const handleReject = (reject_reason: string) => {
    if (!app) return;
    const onDone = {
      onSuccess: () => {
        toast.success('Application rejected');
        setRejectOpen(false);
      },
      onError: toastError('Failed to reject application'),
    };

    if (user?.role === 'admin' && app.status === 'pending_admin') {
      reviewMutation.mutate(
        { id: id!, action: 'reject', reject_reason },
        onDone,
      );
    } else if (
      user?.role === 'super_admin' &&
      app.status === 'pending_super_admin'
    ) {
      signMutation.mutate(
        { id: id!, action: 'reject', signature_secret: '', reject_reason },
        onDone,
      );
    }
  };

  // ── Super Admin: sign via POST /sign with signature_secret ─
  const handleSignAsSuperAdmin = (signature_secret: string) => {
    signMutation.mutate(
      { id: id!, action: 'approve', signature_secret },
      {
        onSuccess: () => {
          toast.success('Document signed');
          setSignOpen(false);
        },
        onError: toastError('Failed to sign document'),
      },
    );
  };

  // ── Loading / Error ───────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !app) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-destructive">Application not found.</p>
        <Button
          variant="outline"
          onClick={() => navigate('/applications')}
        >
          Back to list
        </Button>
      </div>
    );
  }

  const canSubmit =
    user?.role === 'district_admin' &&
    (app.status === 'draft' || app.status === 'clarification_needed');
  const canReview =
    user?.role === 'admin' && app.status === 'pending_admin';
  const canSign =
    user?.role === 'super_admin' && app.status === 'pending_super_admin';

  const hasWateringTasks = ['signed', 'watering_in_progress', 'completed'].includes(
    app.status,
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/applications')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{app.application_no}</h1>
            <StatusBadge status={app.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Created {new Date(app.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* ── Workflow action buttons ── */}
      {(canSubmit || canReview || canSign) && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            {canSubmit && (
              <Button disabled={actionPending} onClick={handleSubmitToAdmin}>
                {actionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit to Admin
              </Button>
            )}

            {canReview && (
              <>
                <Button disabled={actionPending} onClick={handleApproveAsAdmin}>
                  {actionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve &amp; Forward to Super Admin
                </Button>
                <Button
                  variant="outline"
                  disabled={actionPending}
                  onClick={() => setClarifyOpen(true)}
                >
                  Request Clarification
                </Button>
                <Button
                  variant="destructive"
                  disabled={actionPending}
                  onClick={() => setRejectOpen(true)}
                >
                  Reject
                </Button>
              </>
            )}

            {canSign && (
              <>
                <Button
                  disabled={actionPending}
                  onClick={() => setSignOpen(true)}
                >
                  Sign Document
                </Button>
                <Button
                  variant="destructive"
                  disabled={actionPending}
                  onClick={() => setRejectOpen(true)}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* ── Tabbed content ── */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          {hasWateringTasks && (
            <>
              <TabsTrigger value="watering">Watering</TabsTrigger>
              <TabsTrigger value="inspections">Inspections</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </>
          )}
          <TabsTrigger value="audit">Audit History</TabsTrigger>
        </TabsList>

        {/* ── Details tab ── */}
        <TabsContent value="details" className="space-y-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-muted-foreground">District</span>
                <span>{app.district?.name ?? '—'}</span>
                <span className="text-muted-foreground">Section</span>
                <span>{app.section}</span>
                <span className="text-muted-foreground">Quantity</span>
                <span>{app.quantity.toLocaleString()} saplings</span>
                <span className="text-muted-foreground">Planting Date</span>
                <span>
                  {new Date(app.planting_date).toLocaleDateString()}
                </span>
                <span className="text-muted-foreground">Water Method</span>
                <span className="capitalize">
                  {app.water_method.replace('_', ' ')}
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial & Notes</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-muted-foreground">Estimated Cost</span>
                <span>{app.estimated_cost?.toLocaleString() ?? '—'}</span>
                <span className="text-muted-foreground">Actual Cost</span>
                <span>{app.actual_cost?.toLocaleString() ?? '—'}</span>
                <span className="text-muted-foreground">Notes</span>
                <span>{app.notes || '—'}</span>
                <span className="text-muted-foreground">Admin Notes</span>
                <span>{app.admin_notes || '—'}</span>
                {app.reject_reason && (
                  <>
                    <span className="text-muted-foreground">
                      Reject Reason
                    </span>
                    <span className="text-destructive">
                      {app.reject_reason}
                    </span>
                  </>
                )}
                {app.digital_signature && (
                  <>
                    <span className="text-muted-foreground">
                      Digital Signature
                    </span>
                    <span className="break-all font-mono text-xs">
                      {app.digital_signature}
                    </span>
                  </>
                )}
                {app.approved_at && (
                  <>
                    <span className="text-muted-foreground">Approved At</span>
                    <span>
                      {new Date(app.approved_at).toLocaleString()}
                    </span>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {!hasWateringTasks && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                Watering, Inspections, and Map tabs will become available after
                the application is signed and approved.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Watering tab (post-approval only) ── */}
        {hasWateringTasks && (
          <TabsContent value="watering" className="pt-4">
            <WateringTasks
              applicationId={id!}
              totalSaplings={app.quantity}
            />
          </TabsContent>
        )}

        {/* ── Inspections tab (post-approval only) ── */}
        {hasWateringTasks && (
          <TabsContent value="inspections" className="pt-4">
            <InspectionsList applicationId={id!} />
          </TabsContent>
        )}

        {/* ── Map tab (post-approval only) ── */}
        {hasWateringTasks && (
          <TabsContent value="map" className="pt-4">
            <ApplicationMap application={app} />
          </TabsContent>
        )}

        {/* ── Audit History tab ── */}
        <TabsContent value="audit" className="pt-4">
          <AuditHistory applicationId={id!} />
        </TabsContent>
      </Tabs>

      {/* ── Workflow modals ── */}
      <RejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
        isPending={reviewMutation.isPending || signMutation.isPending}
      />
      <ClarifyModal
        open={clarifyOpen}
        onOpenChange={setClarifyOpen}
        onConfirm={handleRequestClarification}
        isPending={reviewMutation.isPending}
      />
      <SignDocumentModal
        open={signOpen}
        onOpenChange={setSignOpen}
        onConfirm={handleSignAsSuperAdmin}
        isPending={signMutation.isPending}
      />
    </div>
  );
}
