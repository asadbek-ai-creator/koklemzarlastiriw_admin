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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateUser } from '@/features/users/hooks/useUsers';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useDistricts } from '@/shared/hooks/useDistricts';
import type { User, UserRole } from '@/shared/types/api.types';

const CREATABLE_BY: Record<UserRole, UserRole[]> = {
  super_admin: ['super_admin', 'admin', 'district_admin', 'auditor'],
  admin: ['district_admin', 'auditor'],
  district_admin: [],
  auditor: [],
};

const schema = z
  .object({
    full_name: z.string().min(2, 'Full name is required'),
    username: z
      .string()
      .min(3, 'At least 3 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Letters, digits and underscores only'),
    role: z.enum(['super_admin', 'admin', 'district_admin', 'auditor'], {
      message: 'Select a role',
    }),
    is_active: z.boolean(),
    district_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'district_admin' && !data.district_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['district_id'],
        message: 'District is required for District Admin',
      });
    }
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function EditUserModal({ open, onOpenChange, user }: Props) {
  const { t } = useTranslation();
  const actor = useAuthStore((s) => s.user);
  const updateMutation = useUpdateUser();

  const allowedRoles: UserRole[] = actor ? CREATABLE_BY[actor.role] : [];

  const { districts } = useDistricts();

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
      full_name: user.full_name,
      username: user.username,
      role: user.role,
      is_active: user.is_active,
      district_id: user.district_id ?? undefined,
    },
  });

  useEffect(() => {
    reset({
      full_name: user.full_name,
      username: user.username,
      role: user.role,
      is_active: user.is_active,
      district_id: user.district_id ?? undefined,
    });
  }, [user, reset]);

  const selectedRole = watch('role');
  const isActive = watch('is_active');

  useEffect(() => {
    if (selectedRole !== 'district_admin') {
      setValue('district_id', undefined as unknown as string, {
        shouldValidate: false,
      });
    }
  }, [selectedRole, setValue]);

  const onSubmit = async (values: Record<string, unknown>) => {
    const data = values as FormValues;
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        data: {
          full_name: data.full_name,
          username: data.username,
          role: data.role,
          is_active: data.is_active,
          district_id:
            data.role === 'district_admin' && data.district_id
              ? data.district_id
              : null,
        },
      });
      toast.success(t('toast.userUpdated', { username: data.username }));
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t('toast.userUpdateFailed');
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
          <DialogTitle>{t('editUser.title')}</DialogTitle>
          <DialogDescription>
            {t('editUser.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit_full_name">{t('createUser.fullName')}</Label>
            <Input
              id="edit_full_name"
              placeholder="e.g. Bobur Aliyev"
              {...register('full_name')}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="edit_username">{t('createUser.username')}</Label>
            <Input
              id="edit_username"
              autoComplete="off"
              placeholder="e.g. bobur"
              {...register('username')}
            />
            {errors.username && (
              <p className="text-xs text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label>{t('createUser.role')}</Label>
            <Select
              modal={false}
              value={selectedRole}
              onValueChange={(v) =>
                setValue('role', v as UserRole, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('createUser.selectRole')} />
              </SelectTrigger>
              <SelectContent disablePortal>
                {allowedRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`role.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          {/* Active status */}
          <div className="space-y-1.5">
            <Label>{t('editUser.isActive')}</Label>
            <Select
              modal={false}
              value={isActive ? 'true' : 'false'}
              onValueChange={(v) =>
                setValue('is_active', v === 'true', { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent disablePortal>
                <SelectItem value="true">{t('common.active')}</SelectItem>
                <SelectItem value="false">{t('common.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* District — shown only when role === 'district_admin' */}
          {selectedRole === 'district_admin' && (
            <div className="space-y-1.5">
              <Label>{t('createUser.district')}</Label>
              <Select
                modal={false}
                value={watch('district_id') || ''}
                onValueChange={(v) =>
                  setValue('district_id', v as string, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('createUser.selectDistrict')} />
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
                <p className="text-xs text-destructive">
                  {errors.district_id.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('editUser.saveButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
