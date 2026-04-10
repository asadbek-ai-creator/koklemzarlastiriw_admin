import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  onConfirm: (reject_reason: string) => void;
  isPending?: boolean;
}

export function RejectModal({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: Props) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { reject_reason: '' },
  });

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
          <DialogTitle>{t('rejectModal.title')}</DialogTitle>
          <DialogDescription>
            {t('rejectModal.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reject_reason">{t('rejectModal.label')}</Label>
            <Textarea
              id="reject_reason"
              rows={4}
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
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('rejectModal.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
