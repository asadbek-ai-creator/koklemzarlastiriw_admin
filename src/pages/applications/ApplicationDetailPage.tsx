import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

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
import { PhotoGallery } from '@/shared/components/PhotoGallery';

export default function ApplicationDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useApplication(id!);
  const app = data?.data;

  const statusMutation = useUpdateApplicationStatus();
  const reviewMutation = useReviewApplication();
  const signMutation = useSignApplication();

  const actionPending =
    statusMutation.isPending ||
    reviewMutation.isPending ||
    signMutation.isPending;

  const [rejectOpen, setRejectOpen] = useState(false);
  const [clarifyOpen, setClarifyOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);

  const toastError = (fallback: string) => (err: unknown) => {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? fallback;
    toast.error(message);
  };

  const handleSubmitToAdmin = () => {
    statusMutation.mutate(
      { id: id!, status: 'pending_admin' },
      {
        onSuccess: () => toast.success(t('toast.submitSuccess')),
        onError: toastError(t('toast.submitFailed')),
      },
    );
  };

  const handleApproveAsAdmin = () => {
    reviewMutation.mutate(
      { id: id!, action: 'approve', admin_notes: 'Approved by admin' },
      {
        onSuccess: () => toast.success(t('toast.approvedForward')),
        onError: toastError(t('toast.approveFailed')),
      },
    );
  };

  const handleRequestClarification = (admin_notes: string) => {
    reviewMutation.mutate(
      { id: id!, action: 'clarify', admin_notes },
      {
        onSuccess: () => {
          toast.success(t('toast.clarificationRequested'));
          setClarifyOpen(false);
        },
        onError: toastError(t('toast.clarificationFailed')),
      },
    );
  };

  const handleReject = (reject_reason: string) => {
    if (!app) return;
    const onDone = {
      onSuccess: () => {
        toast.success(t('toast.rejected'));
        setRejectOpen(false);
      },
      onError: toastError(t('toast.rejectFailed')),
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

  const handleSignAsSuperAdmin = (signature_secret: string) => {
    signMutation.mutate(
      { id: id!, action: 'approve', signature_secret },
      {
        onSuccess: () => {
          toast.success(t('toast.signed'));
          setSignOpen(false);
        },
        onError: toastError(t('toast.signFailed')),
      },
    );
  };

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
        <p className="text-destructive">{t('appDetail.notFound')}</p>
        <Button
          variant="outline"
          onClick={() => navigate('/applications')}
        >
          {t('appDetail.backToList')}
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
            {t('appDetail.created', { date: new Date(app.created_at).toLocaleDateString() })}
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
                {t('appDetail.submitToAdmin')}
              </Button>
            )}

            {canReview && (
              <>
                <Button disabled={actionPending} onClick={handleApproveAsAdmin}>
                  {actionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('appDetail.approveForward')}
                </Button>
                <Button
                  variant="outline"
                  disabled={actionPending}
                  onClick={() => setClarifyOpen(true)}
                >
                  {t('appDetail.requestClarification')}
                </Button>
                <Button
                  variant="destructive"
                  disabled={actionPending}
                  onClick={() => setRejectOpen(true)}
                >
                  {t('appDetail.reject')}
                </Button>
              </>
            )}

            {canSign && (
              <>
                <Button
                  disabled={actionPending}
                  onClick={() => setSignOpen(true)}
                >
                  {t('appDetail.signDocument')}
                </Button>
                <Button
                  variant="destructive"
                  disabled={actionPending}
                  onClick={() => setRejectOpen(true)}
                >
                  {t('appDetail.reject')}
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
          <TabsTrigger value="details">{t('appDetail.details')}</TabsTrigger>
          {hasWateringTasks && (
            <>
              <TabsTrigger value="watering">{t('appDetail.watering')}</TabsTrigger>
              <TabsTrigger value="inspections">{t('appDetail.inspections')}</TabsTrigger>
              <TabsTrigger value="map">{t('appDetail.map')}</TabsTrigger>
            </>
          )}
          <TabsTrigger value="audit">{t('appDetail.auditHistory')}</TabsTrigger>
        </TabsList>

        {/* ── Details tab ── */}
        <TabsContent value="details" className="space-y-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('appDetail.generalInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-muted-foreground">{t('appDetail.district')}</span>
                <span>{app.district?.name ?? '—'}</span>
                <span className="text-muted-foreground">{t('appDetail.section')}</span>
                <span>{app.section}</span>
                <span className="text-muted-foreground">{t('appDetail.saplingType')}</span>
                <span>
                  {app.sapling_type?.name ?? '—'}
                  {app.sapling_type?.scientific_name && (
                    <span className="ml-1 text-xs italic text-muted-foreground">
                      ({app.sapling_type.scientific_name})
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground">{t('appDetail.quantity')}</span>
                <span>{app.quantity.toLocaleString()} {t('appDetail.saplings')}</span>
                {app.sapling_type && (
                  <>
                    <span className="text-muted-foreground">{t('appDetail.waterPerSapling')}</span>
                    <span>
                      {app.sapling_type.water_require_ltr} L
                      <span className="ml-1 text-xs text-muted-foreground">
                        {t('appDetail.perWatering')}
                      </span>
                    </span>
                    <span className="text-muted-foreground">{t('appDetail.totalWaterNeed')}</span>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      {(
                        app.sapling_type.water_require_ltr * app.quantity
                      ).toLocaleString()}{' '}
                      L
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {t('appDetail.perWatering')}
                      </span>
                    </span>
                  </>
                )}
                <span className="text-muted-foreground">{t('appDetail.plantingDate')}</span>
                <span>
                  {new Date(app.planting_date).toLocaleDateString()}
                </span>
                <span className="text-muted-foreground">{t('appDetail.waterMethodLabel')}</span>
                <span>
                  {t(`waterMethod.${app.water_method}`)}
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('appDetail.financialNotes')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-muted-foreground">{t('appDetail.estimatedCost')}</span>
                <span>{app.estimated_cost?.toLocaleString() ?? '—'}</span>
                <span className="text-muted-foreground">{t('appDetail.actualCost')}</span>
                <span>{app.actual_cost?.toLocaleString() ?? '—'}</span>
                <span className="text-muted-foreground">{t('appDetail.notes')}</span>
                <span>{app.notes || '—'}</span>
                <span className="text-muted-foreground">{t('appDetail.adminNotes')}</span>
                <span>{app.admin_notes || '—'}</span>
                {app.reject_reason && (
                  <>
                    <span className="text-muted-foreground">
                      {t('appDetail.rejectReason')}
                    </span>
                    <span className="text-destructive">
                      {app.reject_reason}
                    </span>
                  </>
                )}
                {app.digital_signature && (
                  <>
                    <span className="text-muted-foreground">
                      {t('appDetail.digitalSignature')}
                    </span>
                    <span className="break-all font-mono text-xs">
                      {app.digital_signature}
                    </span>
                  </>
                )}
                {app.approved_at && (
                  <>
                    <span className="text-muted-foreground">{t('appDetail.approvedAt')}</span>
                    <span>
                      {new Date(app.approved_at).toLocaleString()}
                    </span>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('appDetail.photos')}</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoGallery
                photos={app.photos ?? []}
                emptyMessage={t('appDetail.noPhotos')}
              />
            </CardContent>
          </Card>

          {!hasWateringTasks && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                {t('appDetail.wateringNotAvailable')}
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
