import { useState } from 'react';
import {
  Plus,
  Search,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

import {
  useDistrictsList,
  useDeleteDistrict,
} from '@/features/districts/hooks/useDistricts';
import { CreateDistrictModal } from '@/features/districts/components/CreateDistrictModal';
import { UpdateDistrictModal } from '@/features/districts/components/UpdateDistrictModal';
import type { District } from '@/shared/types/api.types';

export default function DistrictsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editDistrict, setEditDistrict] = useState<District | null>(null);
  const [toDelete, setToDelete] = useState<District | null>(null);

  const { data, isLoading, isFetching } = useDistrictsList();
  const allDistricts = data?.data ?? [];

  const filtered = search
    ? allDistricts.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase()),
      )
    : allDistricts;

  const deleteMutation = useDeleteDistrict();

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success(t('toast.districtDeleted', { name: toDelete.name }));
        setToDelete(null);
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? t('toast.districtDeleteFailed');
        toast.error(message);
      },
    });
  };

  const formatBudget = (budget: number) =>
    new Intl.NumberFormat('uz-UZ').format(budget);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <MapPin className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
            {t('districts.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('districts.subtitle')}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('districts.addDistrict')}
        </Button>
      </div>

      {/* ── Search ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('districts.searchPlaceholder')}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isFetching && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* ── Table ── */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-emerald-50/60 dark:bg-emerald-950/20">
            <TableRow>
              <TableHead>{t('districts.name')}</TableHead>
              <TableHead>{t('districts.code')}</TableHead>
              <TableHead>{t('districts.region')}</TableHead>
              <TableHead>{t('districts.budget')}</TableHead>
              <TableHead>{t('districts.status')}</TableHead>
              <TableHead className="text-right">{t('districts.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t('districts.noDistricts')}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="font-mono text-xs">{d.code}</TableCell>
                  <TableCell>{d.region || '—'}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatBudget(d.budget)}
                  </TableCell>
                  <TableCell>
                    {d.is_active ? (
                      <Badge variant="default">{t('common.active')}</Badge>
                    ) : (
                      <Badge variant="destructive">{t('common.inactive')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditDistrict(d)}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        {t('districts.edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setToDelete(d)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {t('districts.delete')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Create Modal ── */}
      <CreateDistrictModal open={createOpen} onOpenChange={setCreateOpen} />

      {/* ── Update Modal ── */}
      {editDistrict && (
        <UpdateDistrictModal
          open={!!editDistrict}
          onOpenChange={(next) => !next && setEditDistrict(null)}
          district={editDistrict}
        />
      )}

      {/* ── Delete Confirmation ── */}
      <AlertDialog
        open={!!toDelete}
        onOpenChange={(next) => !next && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('districts.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete &&
                t('districts.deleteDescription', { name: toDelete.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setToDelete(null)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={confirmDelete}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('districts.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
