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
  admin_notes: z
    .string()
    .trim()
    .min(5, 'Please provide at least 5 characters')
    .max(500, 'Keep the notes under 500 characters'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (admin_notes: string) => void;
  isPending?: boolean;
}

export function ClarifyModal({
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
    defaultValues: { admin_notes: '' },
  });

  useEffect(() => {
    if (open) reset({ admin_notes: '' });
  }, [open, reset]);

  const onSubmit = (values: Record<string, unknown>) => {
    const data = values as FormValues;
    onConfirm(data.admin_notes.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('clarifyModal.title')}</DialogTitle>
          <DialogDescription>
            {t('clarifyModal.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin_notes">{t('clarifyModal.label')}</Label>
            <Textarea
              id="admin_notes"
              rows={4}
              autoFocus
              {...register('admin_notes')}
            />
            {errors.admin_notes && (
              <p className="text-xs text-destructive">
                {errors.admin_notes.message}
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('clarifyModal.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
