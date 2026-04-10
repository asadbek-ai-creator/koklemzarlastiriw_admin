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

import { useCreateUser } from '@/features/users/hooks/useUsers';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useDistricts } from '@/shared/hooks/useDistricts';
import type { UserRole } from '@/shared/types/api.types';

// ── Role options (filtered by actor's role at render time) ──

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  district_admin: 'District Admin',
  auditor: 'Auditor',
};

const CREATABLE_BY: Record<UserRole, UserRole[]> = {
  super_admin: ['super_admin', 'admin', 'district_admin', 'auditor'],
  admin: ['district_admin', 'auditor'],
  district_admin: [],
  auditor: [],
};

// ── Validation schema ──────────────────────────────────────

const schema = z
  .object({
    full_name: z.string().min(2, 'Full name is required'),
    username: z
      .string()
      .min(3, 'At least 3 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Letters, digits and underscores only'),
    password: z.string().min(6, 'At least 6 characters'),
    role: z.enum(['super_admin', 'admin', 'district_admin', 'auditor'], {
      message: 'Select a role',
    }),
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
}

export function CreateUserModal({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const actor = useAuthStore((s) => s.user);
  const createMutation = useCreateUser();

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
      full_name: '',
      username: '',
      password: '',
      role: undefined as unknown as UserRole,
      district_id: undefined as unknown as string,
    },
  });

  const selectedRole = watch('role');

  // Clear the district field whenever the selected role stops
  // being district_admin — otherwise a stale UUID would survive
  // role changes and silently ride along with the POST body.
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
      await createMutation.mutateAsync({
        full_name: data.full_name,
        username: data.username,
        password: data.password,
        role: data.role,
        ...(data.role === 'district_admin' && data.district_id
          ? { district_id: data.district_id }
          : {}),
      });
      toast.success(t('toast.userCreated', { username: data.username }));
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t('toast.userCreateFailed');
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
          <DialogTitle>{t('createUser.title')}</DialogTitle>
          <DialogDescription>
            {t('createUser.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="full_name">{t('createUser.fullName')}</Label>
            <Input
              id="full_name"
              placeholder="e.g. Bobur Aliyev"
              {...register('full_name')}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">{t('createUser.username')}</Label>
              <Input
                id="username"
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
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('createUser.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
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
              items={allowedRoles.map((r) => ({
                value: r,
                label: t(`role.${r}`),
              }))}
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

          {/* District — shown only when role === 'district_admin' */}
          {selectedRole === 'district_admin' && (
            <div className="space-y-1.5">
              <Label>{t('createUser.district')}</Label>
              <Select
                modal={false}
                onValueChange={(v) =>
                  setValue('district_id', v as string, { shouldValidate: true })
                }
                items={districts.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('createUser.createButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
