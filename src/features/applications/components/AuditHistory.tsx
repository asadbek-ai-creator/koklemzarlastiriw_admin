import { ScrollText, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApplicationAuditLogs } from '@/features/applications/hooks/useAuditHistory';

interface Props {
  applicationId: string;
}

export function AuditHistory({ applicationId }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useApplicationAuditLogs(applicationId);
  const logs = data?.data ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="h-5 w-5" />
          {t('auditHistory.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('auditHistory.noRecords')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('auditHistory.date')}</TableHead>
                  <TableHead>{t('auditHistory.action')}</TableHead>
                  <TableHead>{t('auditHistory.description')}</TableHead>
                  <TableHead>{t('auditHistory.oldValue')}</TableHead>
                  <TableHead>{t('auditHistory.newValue')}</TableHead>
                  <TableHead>{t('auditHistory.ip')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {t(`auditAction.${log.action}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">
                      {log.description || '—'}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">
                      {log.old_value || '—'}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">
                      {log.new_value || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.ip_address || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
