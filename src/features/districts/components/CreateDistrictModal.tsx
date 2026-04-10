import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useCreateDistrict } from '@/features/districts/hooks/useDistricts';

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
}

export function CreateDistrictModal({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const createMutation = useCreateDistrict();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      region: '',
      budget: undefined,
      is_active: true,
    },
  });

  const onSubmit = async (raw: Record<string, unknown>) => {
    const values = raw as FormValues;
    try {
      await createMutation.mutateAsync({
        name: values.name,
        code: values.code,
        ...(values.region ? { region: values.region } : {}),
        ...(values.budget !== undefined ? { budget: values.budget } : {}),
        is_active: values.is_active,
      });
      toast.success(t('toast.districtCreated', { name: values.name }));
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t('toast.districtCreateFailed');
      toast.error(message);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('createDistrict.title')}</DialogTitle>
          <DialogDescription>
            {t('createDistrict.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="district-name">{t('createDistrict.name')}</Label>
              <Input id="district-name" {...register('name')} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="district-code">{t('createDistrict.code')}</Label>
              <Input id="district-code" placeholder="e.g. CHR" {...register('code')} />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="district-region">{t('createDistrict.region')}</Label>
              <Input id="district-region" {...register('region')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="district-budget">{t('createDistrict.budget')}</Label>
              <Input
                id="district-budget"
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
              id="district-active"
              className="h-4 w-4 rounded border-gray-300"
              {...register('is_active')}
            />
            <Label htmlFor="district-active">{t('createDistrict.isActive')}</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('createDistrict.createButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
