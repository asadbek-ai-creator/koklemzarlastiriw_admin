import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { api } from '@/shared/api/axios.instance';
import type { WaterMethod, District, SaplingType, ApiEnvelope } from '@/shared/types/api.types';

const waterMethods: { value: WaterMethod; label: string }[] = [
  { value: 'tanker',      label: 'Tanker' },
  { value: 'drip',        label: 'Drip Irrigation' },
  { value: 'stationary',  label: 'Stationary' },
  { value: 'well',        label: 'Well' },
  { value: 'mobile_pump', label: 'Mobile Pump' },
  { value: 'manual',      label: 'Manual' },
];

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

export function CreateApplicationModal({ open, onOpenChange }: Props) {
  const createMutation = useCreateApplication();

  const { data: districts = [] } = useQuery({
    queryKey: ['districts'],
    queryFn: () => api.get<ApiEnvelope<District[]>>('/districts').then((r) => r.data.data),
  });

  const { data: saplingTypes = [] } = useQuery({
    queryKey: ['sapling-types'],
    queryFn: () => api.get<ApiEnvelope<SaplingType[]>>('/sapling-types').then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
      await createMutation.mutateAsync({
        ...data,
        planting_date: new Date(data.planting_date).toISOString(),
      });
      toast.success('Application created successfully');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to create application');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Application</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* District & Sapling Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>District</Label>
              <Select
                modal={false}
                onValueChange={(v) => setValue('district_id', v as string, { shouldValidate: true })}
                items={districts.map((d) => ({ value: d.id, label: d.name }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
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
              <Label>Sapling Type</Label>
              <Select
                modal={false}
                onValueChange={(v) => setValue('sapling_type_id', v as string, { shouldValidate: true })}
                items={saplingTypes.map((s) => ({ value: s.id, label: s.name }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sapling type" />
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
            <Label htmlFor="section">Section</Label>
            <Input id="section" placeholder="e.g. 21-27km" {...register('section')} />
            {errors.section && (
              <p className="text-xs text-destructive">{errors.section.message}</p>
            )}
          </div>

          {/* GPS Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gps_latitude">Latitude</Label>
              <Input id="gps_latitude" type="number" step="any" {...register('gps_latitude', { valueAsNumber: true })} />
              {errors.gps_latitude && (
                <p className="text-xs text-destructive">{errors.gps_latitude.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gps_longitude">Longitude</Label>
              <Input id="gps_longitude" type="number" step="any" {...register('gps_longitude', { valueAsNumber: true })} />
              {errors.gps_longitude && (
                <p className="text-xs text-destructive">{errors.gps_longitude.message}</p>
              )}
            </div>
          </div>

          {/* Address (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="gps_address">Address (optional)</Label>
            <Input id="gps_address" {...register('gps_address')} />
          </div>

          {/* Quantity & Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min={1} {...register('quantity', { valueAsNumber: true })} />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estimated_cost">Estimated Cost</Label>
              <Input id="estimated_cost" type="number" min={0} {...register('estimated_cost', { valueAsNumber: true })} />
            </div>
          </div>

          {/* Planting Date */}
          <div className="space-y-1.5">
            <Label htmlFor="planting_date">Planting Date</Label>
            <Input id="planting_date" type="date" {...register('planting_date')} />
            {errors.planting_date && (
              <p className="text-xs text-destructive">{errors.planting_date.message}</p>
            )}
          </div>

          {/* Water Method */}
          <div className="space-y-1.5">
            <Label>Water Method</Label>
            <Select modal={false} onValueChange={(v) => setValue('water_method', v as WaterMethod, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent disablePortal>
                {waterMethods.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
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
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" rows={3} {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
