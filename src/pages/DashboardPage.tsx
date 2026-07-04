import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileStack, FolderOpen, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { analyticsApi, casesApi } from "@/lib/endpoints";
import type { ContentTypeBreakdown, DashboardOverview, TimelinePoint, CaseSummary } from "@/types/api";
import { KpiCard } from "@/components/ui/KpiCard";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { TimelineChart } from "@/components/charts/TimelineChart";
import { ContentBreakdownChart } from "@/components/charts/ContentBreakdownChart";
import { VerdictPill } from "@/components/ui/VerdictStamp";
import { PageLoading, ErrorState, EmptyState } from "@/components/ui/Feedback";
import { getErrorMessage } from "@/lib/api";
import { format, parseISO } from "date-fns";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [breakdown, setBreakdown] = useState<ContentTypeBreakdown | null>(null);
  const [recentCases, setRecentCases] = useState<CaseSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [ov, tl, bd, cs] = await Promise.all([
        analyticsApi.overview(),
        analyticsApi.timeline(30),
        analyticsApi.byType(),
        casesApi.list({ page: 1, page_size: 5, classification: "malicious" }),
      ]);
      setOverview(ov);
      setTimeline(tl);
      setBreakdown(bd);
      setRecentCases(cs.items);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <PageLoading />;
  if (error || !overview) return <ErrorState message={error ?? t.common.error} onRetry={loadAll} />;

  return (
    <div className="space-y-6 p-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.dashboard.totalSubmissions}
          value={overview.total_submissions}
          icon={<FileStack className="h-4 w-4" strokeWidth={1.75} />}
          footnote={`+${overview.submissions_today} ${t.dashboard.today}`}
        />
        <KpiCard
          label={t.dashboard.openCases}
          value={overview.open_cases}
          icon={<FolderOpen className="h-4 w-4" strokeWidth={1.75} />}
          footnote={`+${overview.cases_today} ${t.dashboard.today}`}
        />
        <KpiCard
          label={t.dashboard.maliciousCases}
          value={overview.malicious_cases}
          icon={<ShieldAlert className="h-4 w-4" strokeWidth={1.75} />}
          tone="danger"
          footnote={`+${overview.malicious_today} ${t.dashboard.today}`}
        />
        <KpiCard
          label={t.dashboard.resolvedCases}
          value={overview.resolved_cases}
          icon={<CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />}
          tone="safe"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.dashboard.timeline}</CardTitle>
          </CardHeader>
          <CardBody>
            <TimelineChart data={timeline} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.breakdown}</CardTitle>
          </CardHeader>
          <CardBody>
            <ContentBreakdownChart data={breakdown} />
          </CardBody>
        </Card>
      </div>

      {/* Recent high-risk cases */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.recentCases}</CardTitle>
          <Link to="/cases?classification=malicious" className="text-sm font-medium text-navy-600 hover:underline">
            {t.dashboard.viewAll} →
          </Link>
        </CardHeader>
        {recentCases.length === 0 ? (
          <EmptyState title={t.dashboard.noRecentCases} />
        ) : (
          <div className="divide-y divide-line">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-paper-50"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-medium text-slate-900">{c.case_number}</p>
                  <p className="text-xs text-slate-500">
                    {format(parseISO(c.created_at), "PPp")} · {c.content_type}
                  </p>
                </div>
                <VerdictPill classification={c.classification} score={c.risk_score} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
