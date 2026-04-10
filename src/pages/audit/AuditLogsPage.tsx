import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ScrollText,
  Search,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useAuditLogs } from '@/features/audit/hooks/useAuditLogs';
import type {
  AuditAction,
  AuditLogListParams,
} from '@/shared/types/api.types';

const PAGE_SIZE = 25;

const ALL_ACTIONS: AuditAction[] = [
  'create',
  'update',
  'delete',
  'approve',
  'reject',
  'sign',
  'login',
  'inspect',
  'export',
];

const ACTION_VARIANTS: Record<
  AuditAction,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  create: 'default',
  update: 'secondary',
  delete: 'destructive',
  approve: 'default',
  reject: 'destructive',
  sign: 'default',
  login: 'outline',
  inspect: 'secondary',
  export: 'outline',
};

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const params: AuditLogListParams = {
    page,
    limit: PAGE_SIZE,
    ...(userId && { user_id: userId }),
    ...(actionFilter !== 'all' && { action: actionFilter }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo }),
  };

  const { data, isLoading, isFetching } = useAuditLogs(params);
  const logs = data?.data ?? [];
  const meta = data?.meta;

  const resetFilters = () => {
    setUserId('');
    setActionFilter('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters =
    userId !== '' ||
    actionFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '';

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ScrollText className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
            {t('audit.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('audit.subtitle')}
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <Card className="border-emerald-100 dark:border-emerald-900/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('audit.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="filter-user-id">{t('audit.userId')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="filter-user-id"
                  placeholder={t('audit.userIdPlaceholder')}
                  className="pl-9 font-mono text-xs"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t('audit.action')}</Label>
              <Select
                value={actionFilter}
                onValueChange={(v) => {
                  setActionFilter((v ?? 'all') as AuditAction | 'all');
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('audit.allActions')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('audit.allActions')}</SelectItem>
                  {ALL_ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {t(`auditAction.${a}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-date-from">{t('audit.from')}</Label>
              <Input
                id="filter-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filter-date-to">{t('audit.to')}</Label>
              <Input
                id="filter-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="mr-1.5 h-4 w-4" />
                {t('audit.clearFilters')}
              </Button>
              {isFetching && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-emerald-50/60 dark:bg-emerald-950/20">
            <TableRow>
              <TableHead>{t('audit.timestamp')}</TableHead>
              <TableHead>{t('audit.user')}</TableHead>
              <TableHead>{t('audit.role')}</TableHead>
              <TableHead>{t('audit.action')}</TableHead>
              <TableHead>{t('audit.targetType')}</TableHead>
              <TableHead>{t('audit.targetId')}</TableHead>
              <TableHead>{t('audit.description')}</TableHead>
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
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t('audit.noLogs')}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {log.user?.full_name ?? '—'}
                    {log.user?.username && (
                      <div className="text-xs font-normal text-muted-foreground">
                        @{log.user.username}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.user?.role ? (
                      <Badge variant="outline" className="text-xs">
                        {t(`role.${log.user.role}`)}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={ACTION_VARIANTS[log.action] ?? 'secondary'}
                    >
                      {t(`auditAction.${log.action}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.entity_type ? t(`entityType.${log.entity_type}`, log.entity_type) : '—'}
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate font-mono text-xs text-muted-foreground">
                    {log.entity_id ?? log.application_id ?? '—'}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-sm">
                    {log.description || '—'}
                  </TableCell>
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
    </div>
  );
}
