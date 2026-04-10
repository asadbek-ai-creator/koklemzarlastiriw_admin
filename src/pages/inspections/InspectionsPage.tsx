import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sprout,
  Star,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

import { useGlobalInspections } from '@/features/inspections/hooks/useInspections';

const PAGE_SIZE = 20;

export default function InspectionsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGlobalInspections({
    page,
    limit: PAGE_SIZE,
  });

  const inspections = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Sprout className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
            {t('inspectionsPage.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('inspectionsPage.subtitle')}
          </p>
        </div>
        {isFetching && !isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-emerald-50/60 dark:bg-emerald-950/20">
            <TableRow>
              <TableHead>{t('inspectionsPage.appNo')}</TableHead>
              <TableHead>{t('inspectionsPage.auditor')}</TableHead>
              <TableHead>{t('inspectionsPage.inspectedAt')}</TableHead>
              <TableHead>{t('inspectionsPage.survivalRateOk')}</TableHead>
              <TableHead>{t('inspectionsPage.irrigationOk')}</TableHead>
              <TableHead>{t('inspectionsPage.rating')}</TableHead>
              <TableHead>{t('inspectionsPage.findings')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : inspections.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t('inspectionsPage.noInspections')}
                </TableCell>
              </TableRow>
            ) : (
              inspections.map((insp) => (
                <TableRow key={insp.id}>
                  <TableCell className="font-medium">
                    {insp.application?.application_no ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {insp.auditor?.full_name ?? '—'}
                    {insp.auditor?.username && (
                      <div className="text-xs text-muted-foreground">
                        @{insp.auditor.username}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(insp.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {insp.survival_rate_ok ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t('inspections.survivalOk')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        {t('inspectionsPage.no')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {insp.irrigation_ok ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t('inspections.irrigationOk')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        {t('inspectionsPage.no')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= insp.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {insp.findings || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
    </div>
  );
}
