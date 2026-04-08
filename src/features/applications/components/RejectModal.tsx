import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// ── Shared schema ─────────────────────────────────────────
//
// `reject_reason` is required by Swagger for both the review
// and sign reject flows, with a sensible minimum length so
// admins can't submit a one-word dismissal.

const schema = z.object({
  reject_reason: z
    .string()
    .trim()
    .min(5, 'Please provide at least 5 characters')
    .max(500, 'Keep the reason under 500 characters'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the validated reason; parent fires the mutation. */
  onConfirm: (reject_reason: string) => void;
  isPending?: boolean;
}

export function RejectModal({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { reject_reason: '' },
  });

  // Re-arm the form every time the modal is re-opened so a
  // previously submitted reason doesn't linger in the textarea.
  useEffect(() => {
    if (open) reset({ reject_reason: '' });
  }, [open, reset]);

  const onSubmit = (values: Record<string, unknown>) => {
    const data = values as FormValues;
    onConfirm(data.reject_reason.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Application</DialogTitle>
          <DialogDescription>
            Provide a clear reason. This will be recorded on the application
            and visible to the district admin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reject_reason">Rejection Reason</Label>
            <Textarea
              id="reject_reason"
              rows={4}
              placeholder="e.g. Budget justification is insufficient for the requested quantity."
              autoFocus
              {...register('reject_reason')}
            />
            {errors.reject_reason && (
              <p className="text-xs text-destructive">
                {errors.reject_reason.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
