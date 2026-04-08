import { useState } from 'react';
import { ClipboardCheck, Loader2, Plus, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInspections } from '@/features/inspections/hooks/useInspections';
import { InspectionModal } from './InspectionModal';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface Props {
  applicationId: string;
}

export function InspectionsList({ applicationId }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useInspections(applicationId);
  const inspections = data?.data ?? [];
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Inspections
            </CardTitle>
            {user?.role === 'auditor' && (
              <Button size="sm" onClick={() => setModalOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Add Inspection
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {inspections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No inspections recorded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {inspections.map((insp) => (
                <div
                  key={insp.id}
                  className="rounded-md border p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Star rating */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= insp.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    {insp.survival_rate_ok && (
                      <Badge variant="outline">Survival OK</Badge>
                    )}
                    {insp.irrigation_ok && (
                      <Badge variant="outline">Irrigation OK</Badge>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(insp.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm">{insp.findings}</p>

                  {insp.recommendations && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Recommendation:{' '}
                      </span>
                      {insp.recommendations}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {user?.role === 'auditor' && (
        <InspectionModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          applicationId={applicationId}
        />
      )}
    </>
  );
}
