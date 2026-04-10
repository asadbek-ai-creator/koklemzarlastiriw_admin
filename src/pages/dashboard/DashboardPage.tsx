import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  TreePine,
  CheckCircle2,
  ClipboardList,
  Banknote,
  Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDistrictStats } from '@/features/dashboard/hooks/useAnalytics';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useDistrictStats();
  const stats = data?.data ?? [];

  // ── Aggregated KPIs ───────────────────────────────────────
  const totalApps       = stats.reduce((s, d) => s + d.total_apps, 0);
  const approvedApps    = stats.reduce((s, d) => s + d.approved_apps, 0);
  const completedApps   = stats.reduce((s, d) => s + d.completed_apps, 0);
  const totalSaplings   = stats.reduce((s, d) => s + d.total_saplings, 0);
  const totalCost       = stats.reduce((s, d) => s + d.total_cost, 0);
  const avgSurvival     =
    stats.length > 0
      ? stats.reduce((s, d) => s + d.avg_survival_rate, 0) / stats.length
      : 0;

  const kpis = [
    { title: t('dashboard.totalApplications'),  value: totalApps,                           icon: ClipboardList },
    { title: t('dashboard.approved'),            value: approvedApps,                        icon: CheckCircle2 },
    { title: t('dashboard.completed'),           value: completedApps,                       icon: CheckCircle2 },
    { title: t('dashboard.totalSaplings'),       value: totalSaplings.toLocaleString(),      icon: TreePine },
    { title: t('dashboard.avgSurvivalRate'),     value: `${avgSurvival.toFixed(1)}%`,        icon: TreePine },
    { title: t('dashboard.totalCost'),           value: `${(totalCost / 1_000_000).toFixed(1)}M`, icon: Banknote },
  ];

  // ── Chart data ────────────────────────────────────────────
  const planVsFact = stats.map((d) => ({
    name: d.district_name.length > 12 ? d.district_name.slice(0, 12) + '\u2026' : d.district_name,
    [t('dashboard.chartTotalApps')]:    d.total_apps,
    [t('dashboard.chartApproved')]:     d.approved_apps,
    [t('dashboard.chartCompleted')]:    d.completed_apps,
  }));

  const survivalData = stats.map((d) => ({
    name: d.district_name.length > 12 ? d.district_name.slice(0, 12) + '\u2026' : d.district_name,
    [t('dashboard.chartSurvival')]: d.avg_survival_rate,
  }));

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive">
        {t('dashboard.loadError')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan vs Fact bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.planVsFact')}</CardTitle>
          </CardHeader>
          <CardContent>
            {planVsFact.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {t('common.noData')}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={planVsFact}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={t('dashboard.chartTotalApps')}  fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={t('dashboard.chartApproved')}   fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={t('dashboard.chartCompleted')}  fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Survival rate line chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.survivalByDistrict')}</CardTitle>
          </CardHeader>
          <CardContent>
            {survivalData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {t('common.noData')}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={survivalData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={t('dashboard.chartSurvival')}
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
