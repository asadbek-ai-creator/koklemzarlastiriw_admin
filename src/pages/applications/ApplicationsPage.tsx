import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/features/applications/components/StatusBadge';
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

import { useApplications } from '@/features/applications/hooks/useApplications';
import { CreateApplicationModal } from '@/features/applications/components/CreateApplicationModal';
import { getStatusConfig, ALL_STATUSES } from '@/features/applications/lib/status.utils';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { ApplicationStatus } from '@/shared/types/api.types';

const PAGE_SIZE = 20;

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const params = {
    page,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
  };

  const { data, isLoading, isFetching } = useApplications(params);
  const applications = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    setStatusFilter((value ?? 'all') as ApplicationStatus | 'all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-muted-foreground">
            Manage tree planting applications
          </p>
        </div>
        {user?.role === 'district_admin' && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((s) => {
              const cfg = getStatusConfig(s);
              return (
                <SelectItem key={s} value={s}>
                  {cfg.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* ── Table ── */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App No.</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Section</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Water Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Est. Cost</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No applications found.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow
                  key={app.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  <TableCell className="font-medium">{app.application_no}</TableCell>
                  <TableCell>{app.district?.name ?? '—'}</TableCell>
                  <TableCell>{app.section}</TableCell>
                  <TableCell className="text-right">
                    {app.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="capitalize">
                    {app.water_method.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {app.estimated_cost != null
                      ? app.estimated_cost.toLocaleString()
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {new Date(app.created_at).toLocaleDateString()}
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
            Page {meta.page} of {meta.total_pages} &middot; {meta.total} total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Create Modal (district_admin only) ── */}
      {user?.role === 'district_admin' && (
        <CreateApplicationModal open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </div>
  );
}
