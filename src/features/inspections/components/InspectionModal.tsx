import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateInspection } from '@/features/inspections/hooks/useInspections';
import type { InspectionRequest } from '@/shared/types/api.types';

const schema = z.object({
  findings:         z.string().min(1, 'Findings are required'),
  recommendations:  z.string().optional(),
  rating:           z.number().int().min(1).max(5, 'Rating 1–5'),
  survival_rate_ok: z.boolean(),
  irrigation_ok:    z.boolean(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
}

export function InspectionModal({ open, onOpenChange, applicationId }: Props) {
  const mutation = useCreateInspection(applicationId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      findings: '',
      recommendations: '',
      rating: 5,
      survival_rate_ok: true,
      irrigation_ok: true,
    },
  });

  const currentRating = watch('rating') as number;

  const onSubmit = async (values: Record<string, unknown>) => {
    const data = values as unknown as InspectionRequest;
    try {
      await mutation.mutateAsync(data);
      toast.success('Inspection recorded');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to create inspection');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Inspection</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Rating — star selector */}
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star)}
                  className="rounded p-0.5 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= currentRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-xs text-destructive">{errors.rating.message}</p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                {...register('survival_rate_ok')}
              />
              Survival Rate OK
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                {...register('irrigation_ok')}
              />
              Irrigation OK
            </label>
          </div>

          {/* Findings */}
          <div className="space-y-1.5">
            <Label htmlFor="findings">Findings</Label>
            <Textarea
              id="findings"
              rows={3}
              placeholder="Describe your inspection findings..."
              {...register('findings')}
            />
            {errors.findings && (
              <p className="text-xs text-destructive">{errors.findings.message}</p>
            )}
          </div>

          {/* Recommendations */}
          <div className="space-y-1.5">
            <Label htmlFor="recommendations">Recommendations (optional)</Label>
            <Textarea
              id="recommendations"
              rows={2}
              placeholder="Suggestions for improvement..."
              {...register('recommendations')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Inspection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
