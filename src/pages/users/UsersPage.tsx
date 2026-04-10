import { useState } from 'react';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserX,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useUsers, useDeactivateUser } from '@/features/users/hooks/useUsers';
import { CreateUserModal } from '@/features/users/components/CreateUserModal';
import { EditUserModal } from '@/features/users/components/EditUserModal';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { User, UserRole } from '@/shared/types/api.types';

const PAGE_SIZE = 20;

const ALL_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'district_admin',
  'auditor',
];

export default function UsersPage() {
  const { t } = useTranslation();
  const actor = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [toEdit, setToEdit] = useState<User | null>(null);
  const [toDeactivate, setToDeactivate] = useState<User | null>(null);

  const params = {
    page,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(roleFilter !== 'all' && { role: roleFilter }),
  };

  const { data, isLoading, isFetching } = useUsers(params);
  const users = data?.data ?? [];
  const meta = data?.meta;

  const deactivateMutation = useDeactivateUser();
  const canDeactivate = actor?.role === 'super_admin';
  const canEdit = actor?.role === 'super_admin' || actor?.role === 'admin';
  const showActions = canEdit || canDeactivate;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value: string | null) => {
    setRoleFilter((value ?? 'all') as UserRole | 'all');
    setPage(1);
  };

  const confirmDeactivate = () => {
    if (!toDeactivate) return;
    deactivateMutation.mutate(toDeactivate.id, {
      onSuccess: () => {
        toast.success(t('toast.deactivated', { username: toDeactivate.username }));
        setToDeactivate(null);
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? t('toast.deactivateFailed');
        toast.error(message);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('users.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('users.subtitle')}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('users.addUser')}
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('users.searchPlaceholder')}
            className="pl-9"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder={t('users.filterByRole')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('users.allRoles')}</SelectItem>
            {ALL_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {t(`role.${r}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFetching && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* ── Table ── */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('users.fullName')}</TableHead>
              <TableHead>{t('users.username')}</TableHead>
              <TableHead>{t('users.role')}</TableHead>
              <TableHead>{t('users.status')}</TableHead>
              <TableHead>{t('users.lastLogin')}</TableHead>
              <TableHead>{t('users.created')}</TableHead>
              {showActions && (
                <TableHead className="text-right">{t('users.actions')}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: showActions ? 7 : 6 }).map(
                    (_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 7 : 6}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t('users.noUsers')}
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {u.username}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t(`role.${u.role}`)}</Badge>
                  </TableCell>
                  <TableCell>
                    {u.is_active ? (
                      <Badge variant="default">{t('common.active')}</Badge>
                    ) : (
                      <Badge variant="destructive">{t('common.inactive')}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.last_login_at
                      ? new Date(u.last_login_at).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setToEdit(u)}
                          >
                            <Pencil className="mr-1.5 h-4 w-4" />
                            {t('users.edit')}
                          </Button>
                        )}
                        {canDeactivate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!u.is_active || u.id === actor?.id}
                            onClick={() => setToDeactivate(u)}
                          >
                            <UserX className="mr-1.5 h-4 w-4" />
                            {t('users.deactivate')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('common.page', { current: meta.page, total: meta.total_pages })} &middot; {t('common.totalItems', { count: meta.total })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> {t('common.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('common.next')} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Create user modal ── */}
      <CreateUserModal open={createOpen} onOpenChange={setCreateOpen} />

      {/* ── Edit user modal ── */}
      {toEdit && (
        <EditUserModal
          open={!!toEdit}
          onOpenChange={(next) => !next && setToEdit(null)}
          user={toEdit}
        />
      )}

      {/* ── Deactivate confirmation ── */}
      <AlertDialog
        open={!!toDeactivate}
        onOpenChange={(next) => !next && setToDeactivate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.deactivateTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {toDeactivate &&
                t('users.deactivateDescription', {
                  name: toDeactivate.full_name,
                  username: toDeactivate.username,
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setToDeactivate(null)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deactivateMutation.isPending}
              onClick={confirmDeactivate}
            >
              {deactivateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('users.deactivate')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
