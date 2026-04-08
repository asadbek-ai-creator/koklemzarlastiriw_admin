import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Droplets,
  Loader2,
  TreePine,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWateringTasks } from '@/features/applications/hooks/useWateringTasks';
import { CompleteWateringModal } from './CompleteWateringModal';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { WateringTask } from '@/shared/types/api.types';

interface Props {
  applicationId: string;
  totalSaplings: number;
}

function SurvivalBadge({ task }: { task: WateringTask }) {
  if (!task.is_completed || task.survival_rate == null) return null;

  const rate = task.survival_rate;
  const variant: 'default' | 'secondary' | 'destructive' =
    rate >= 80 ? 'default' : rate >= 50 ? 'secondary' : 'destructive';

  return <Badge variant={variant}>{rate.toFixed(1)}% survival</Badge>;
}

export function WateringTasks({ applicationId, totalSaplings }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useWateringTasks(applicationId);
  const tasks = data?.data ?? [];

  const [completeTask, setCompleteTask] = useState<WateringTask | null>(null);

  // Sort by day_interval
  const sorted = [...tasks].sort((a, b) => a.day_interval - b.day_interval);
  const completedCount = sorted.filter((t) => t.is_completed).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (sorted.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Watering & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No watering tasks scheduled yet. Tasks are auto-created after
            SuperAdmin approval (D+30, D+60, D+90).
          </p>
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
              <Droplets className="h-5 w-5" />
              Watering & Monitoring
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{sorted.length} completed
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(completedCount / sorted.length) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* ── Timeline ── */}
          <div className="relative ml-4 border-l-2 border-muted pl-6">
            {sorted.map((task, idx) => {
              const isLast = idx === sorted.length - 1;

              return (
                <div
                  key={task.id}
                  className={`relative ${isLast ? '' : 'pb-8'}`}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full bg-background">
                    {task.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        Day {task.day_interval}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        — Scheduled:{' '}
                        {new Date(task.scheduled_date).toLocaleDateString()}
                      </span>
                      {task.is_completed && (
                        <Badge variant="outline">Completed</Badge>
                      )}
                      <SurvivalBadge task={task} />
                    </div>

                    {task.is_completed ? (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-md border bg-muted/30 p-3 text-sm sm:grid-cols-4">
                        <div>
                          <span className="text-muted-foreground">Alive</span>
                          <p className="font-medium flex items-center gap-1">
                            <TreePine className="h-3.5 w-3.5" />
                            {task.alive_saplings}/{task.total_saplings}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Water</span>
                          <p className="font-medium">
                            {task.water_used_ltr?.toLocaleString()} L
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost</span>
                          <p className="font-medium">
                            {task.watering_cost?.toLocaleString() ?? '—'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Completed
                          </span>
                          <p className="font-medium">
                            {task.completed_at
                              ? new Date(task.completed_at).toLocaleDateString()
                              : '—'}
                          </p>
                        </div>
                        {task.notes && (
                          <div className="col-span-full mt-1">
                            <span className="text-muted-foreground">Notes</span>
                            <p>{task.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      user?.role === 'district_admin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCompleteTask(task)}
                        >
                          Complete Task
                        </Button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Complete modal */}
      {completeTask && (
        <CompleteWateringModal
          open={!!completeTask}
          onOpenChange={(open) => !open && setCompleteTask(null)}
          taskId={completeTask.id}
          applicationId={applicationId}
          totalSaplings={completeTask.total_saplings || totalSaplings}
        />
      )}
    </>
  );
}
