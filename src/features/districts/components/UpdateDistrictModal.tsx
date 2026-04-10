import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useUpdateDistrict } from '@/features/districts/hooks/useDistricts';
import type { District } from '@/shared/types/api.types';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z
    .string()
    .min(2, 'Min 2 characters')
    .max(10, 'Max 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Uppercase letters and digits only'),
  region: z.string().optional(),
  budget: z.number().min(0, 'Must be ≥ 0').optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  district: District;
}

export function UpdateDistrictModal({ open, onOpenChange, district }: Props) {
  const { t } = useTranslation();
  const updateMutation = useUpdateDistrict();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: district.name,
      code: district.code,
      region: district.region ?? '',
      budget: district.budget ?? undefined,
      is_active: district.is_active,
    },
  });

  useEffect(() => {
    reset({
      name: district.name,
      code: district.code,
      region: district.region ?? '',
      budget: district.budget ?? undefined,
      is_active: district.is_active,
    });
  }, [district, reset]);

  const onSubmit = async (raw: Record<string, unknown>) => {
    const values = raw as FormValues;
    try {
      await updateMutation.mutateAsync({
        id: district.id,
        data: {
          name: values.name,
          code: values.code,
          region: values.region || undefined,
          budget: values.budget,
          is_active: values.is_active,
        },
      });
      toast.success(t('toast.districtUpdated', { name: values.name }));
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t('toast.districtUpdateFailed');
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('updateDistrict.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-district-name">{t('createDistrict.name')}</Label>
              <Input id="edit-district-name" {...register('name')} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-district-code">{t('createDistrict.code')}</Label>
              <Input id="edit-district-code" placeholder="e.g. CHR" {...register('code')} />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-district-region">{t('createDistrict.region')}</Label>
              <Input id="edit-district-region" {...register('region')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-district-budget">{t('createDistrict.budget')}</Label>
              <Input
                id="edit-district-budget"
                type="number"
                min={0}
                {...register('budget', { valueAsNumber: true })}
              />
              {errors.budget && (
                <p className="text-xs text-destructive">{errors.budget.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-district-active"
              className="h-4 w-4 rounded border-gray-300"
              {...register('is_active')}
            />
            <Label htmlFor="edit-district-active">{t('createDistrict.isActive')}</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('updateDistrict.updateButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
