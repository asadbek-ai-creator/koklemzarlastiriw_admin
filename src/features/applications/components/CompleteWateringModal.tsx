import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCompleteWateringTask } from '@/features/applications/hooks/useWateringTasks';
import { useUploadWateringPhotos } from '@/features/applications/hooks/usePhotoUpload';
import { PhotoUploader } from '@/shared/components/PhotoUploader';

const schema = z.object({
  alive_saplings: z.number().int().min(0, 'Must be 0 or more'),
  water_used_ltr: z.number().min(0, 'Must be 0 or more'),
  watering_cost:  z.number().min(0).optional(),
  notes:          z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  applicationId: string;
  totalSaplings: number;
}

export function CompleteWateringModal({
  open,
  onOpenChange,
  taskId,
  applicationId,
  totalSaplings,
}: Props) {
  const { t } = useTranslation();
  const mutation = useCompleteWateringTask(applicationId);
  const uploadPhotosMutation = useUploadWateringPhotos();
  const [photos, setPhotos] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      alive_saplings: totalSaplings,
      water_used_ltr: 0,
      watering_cost: 0,
      notes: '',
    },
  });

  const onSubmit = async (values: Record<string, unknown>) => {
    const data = values as FormValues;
    try {
      await mutation.mutateAsync({ taskId, data });

      if (photos.length > 0) {
        try {
          await uploadPhotosMutation.mutateAsync({
            applicationId,
            taskId,
            files: photos,
          });
        } catch {
          toast.error(t('toast.wateringPhotoFailed'));
        }
      }

      toast.success(t('toast.wateringCompleted'));
      reset();
      setPhotos([]);
      onOpenChange(false);
    } catch {
      toast.error(t('toast.wateringFailed'));
    }
  };

  const isSubmitting = mutation.isPending || uploadPhotosMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('completeWatering.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="alive_saplings">
              {t('completeWatering.aliveSaplings', { total: totalSaplings })}
            </Label>
            <Input
              id="alive_saplings"
              type="number"
              min={0}
              max={totalSaplings}
              {...register('alive_saplings', { valueAsNumber: true })}
            />
            {errors.alive_saplings && (
              <p className="text-xs text-destructive">{errors.alive_saplings.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="water_used_ltr">{t('completeWatering.waterUsed')}</Label>
            <Input
              id="water_used_ltr"
              type="number"
              min={0}
              step="any"
              {...register('water_used_ltr', { valueAsNumber: true })}
            />
            {errors.water_used_ltr && (
              <p className="text-xs text-destructive">{errors.water_used_ltr.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="watering_cost">{t('completeWatering.wateringCost')}</Label>
            <Input
              id="watering_cost"
              type="number"
              min={0}
              step="any"
              {...register('watering_cost', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">{t('completeWatering.notes')}</Label>
            <Textarea id="notes" rows={2} {...register('notes')} />
          </div>

          <div className="space-y-1.5">
            <Label>{t('completeWatering.photos')}</Label>
            <PhotoUploader value={photos} onChange={setPhotos} disabled={isSubmitting} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
