import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateApplication } from '@/features/applications/hooks/useApplications';
import { useUploadApplicationPhotos } from '@/features/applications/hooks/usePhotoUpload';
import { PhotoUploader } from '@/shared/components/PhotoUploader';
import { useDistricts } from '@/shared/hooks/useDistricts';
import { api } from '@/shared/api/axios.instance';
import type { WaterMethod, SaplingType, ApiEnvelope } from '@/shared/types/api.types';

const schema = z.object({
  district_id:     z.string().uuid('Select a district'),
  sapling_type_id: z.string().uuid('Select a sapling type'),
  section:         z.string().min(1, 'Section is required'),
  gps_latitude:    z.number().min(-90).max(90, 'Invalid latitude'),
  gps_longitude:   z.number().min(-180).max(180, 'Invalid longitude'),
  gps_address:     z.string().optional(),
  quantity:        z.number().int().min(1, 'Min 1 sapling'),
  planting_date:   z.string().min(1, 'Date is required'),
  water_method:    z.enum(['tanker', 'drip', 'stationary', 'well', 'mobile_pump', 'manual'], {
    message: 'Select a method',
  }),
  notes:           z.string().optional(),
  estimated_cost:  z.number().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WATER_METHOD_KEYS: WaterMethod[] = ['tanker', 'drip', 'stationary', 'well', 'mobile_pump', 'manual'];

export function CreateApplicationModal({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const createMutation = useCreateApplication();
  const uploadPhotosMutation = useUploadApplicationPhotos();
  const [photos, setPhotos] = useState<File[]>([]);

  const { districts } = useDistricts();

  const { data: saplingTypes = [] } = useQuery({
    queryKey: ['sapling-types'],
    queryFn: () => api.get<ApiEnvelope<SaplingType[]>>('/sapling-types').then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      district_id: undefined as unknown as string,
      sapling_type_id: undefined as unknown as string,
      water_method: undefined as unknown as WaterMethod,
      section: '',
      quantity: 1,
      gps_latitude: 41.311,
      gps_longitude: 69.279,
      planting_date: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (values: Record<string, unknown>) => {
    const data = values as FormValues;
    try {
      const created = await createMutation.mutateAsync({
        ...data,
        planting_date: new Date(data.planting_date).toISOString(),
      });

      if (photos.length > 0) {
        try {
          await uploadPhotosMutation.mutateAsync({
            applicationId: created.data.id,
            files: photos,
          });
        } catch {
          toast.error(t('toast.photoUploadFailed'));
        }
      }

      toast.success(t('toast.applicationCreated'));
      reset();
      setPhotos([]);
      onOpenChange(false);
    } catch {
      toast.error(t('toast.applicationCreateFailed'));
    }
  };

  const isSubmitting = createMutation.isPending || uploadPhotosMutation.isPending;

  const watchedSaplingId = watch('sapling_type_id');
  const watchedQuantity = watch('quantity');
  const selectedSapling = saplingTypes.find((s) => s.id === watchedSaplingId);
  const estimatedWaterLtr =
    selectedSapling && typeof watchedQuantity === 'number' && watchedQuantity > 0
      ? selectedSapling.water_require_ltr * watchedQuantity
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('createApp.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* District & Sapling Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('createApp.district')}</Label>
              <Select
                modal={false}
                onValueChange={(v) => setValue('district_id', v as string, { shouldValidate: true })}
                items={districts.map((d) => ({ value: d.id, label: d.name }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('createApp.selectDistrict')} />
                </SelectTrigger>
                <SelectContent disablePortal>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.district_id && (
                <p className="text-xs text-destructive">{errors.district_id.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t('createApp.saplingType')}</Label>
              <Select
                modal={false}
                onValueChange={(v) => setValue('sapling_type_id', v as string, { shouldValidate: true })}
                items={saplingTypes.map((s) => ({ value: s.id, label: s.name }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('createApp.selectSaplingType')} />
                </SelectTrigger>
                <SelectContent disablePortal>
                  {saplingTypes.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sapling_type_id && (
                <p className="text-xs text-destructive">{errors.sapling_type_id.message}</p>
              )}
            </div>
          </div>

          {/* Section */}
          <div className="space-y-1.5">
            <Label htmlFor="section">{t('createApp.section')}</Label>
            <Input id="section" placeholder="e.g. 21-27km" {...register('section')} />
            {errors.section && (
              <p className="text-xs text-destructive">{errors.section.message}</p>
            )}
          </div>

          {/* GPS Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gps_latitude">{t('createApp.latitude')}</Label>
              <Input id="gps_latitude" type="number" step="any" {...register('gps_latitude', { valueAsNumber: true })} />
              {errors.gps_latitude && (
                <p className="text-xs text-destructive">{errors.gps_latitude.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gps_longitude">{t('createApp.longitude')}</Label>
              <Input id="gps_longitude" type="number" step="any" {...register('gps_longitude', { valueAsNumber: true })} />
              {errors.gps_longitude && (
                <p className="text-xs text-destructive">{errors.gps_longitude.message}</p>
              )}
            </div>
          </div>

          {/* Address (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="gps_address">{t('createApp.address')}</Label>
            <Input id="gps_address" {...register('gps_address')} />
          </div>

          {/* Quantity & Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">{t('createApp.quantity')}</Label>
              <Input id="quantity" type="number" min={1} {...register('quantity', { valueAsNumber: true })} />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
              {estimatedWaterLtr !== null && (
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {t('createApp.estimatedWater', { liters: estimatedWaterLtr.toLocaleString() })}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estimated_cost">{t('createApp.estimatedCost')}</Label>
              <Input id="estimated_cost" type="number" min={0} {...register('estimated_cost', { valueAsNumber: true })} />
            </div>
          </div>

          {/* Planting Date */}
          <div className="space-y-1.5">
            <Label htmlFor="planting_date">{t('createApp.plantingDate')}</Label>
            <Input id="planting_date" type="date" {...register('planting_date')} />
            {errors.planting_date && (
              <p className="text-xs text-destructive">{errors.planting_date.message}</p>
            )}
          </div>

          {/* Water Method */}
          <div className="space-y-1.5">
            <Label>{t('createApp.waterMethod')}</Label>
            <Select modal={false} onValueChange={(v) => setValue('water_method', v as WaterMethod, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder={t('createApp.selectMethod')} />
              </SelectTrigger>
              <SelectContent disablePortal>
                {WATER_METHOD_KEYS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {t(`waterMethod.${m}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.water_method && (
              <p className="text-xs text-destructive">{errors.water_method.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">{t('createApp.notes')}</Label>
            <Textarea id="notes" rows={3} {...register('notes')} />
          </div>

          {/* Photos (optional) */}
          <div className="space-y-1.5">
            <Label>{t('createApp.photos')}</Label>
            <PhotoUploader value={photos} onChange={setPhotos} disabled={isSubmitting} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('createApp.createButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
