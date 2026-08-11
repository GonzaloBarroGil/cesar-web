import { useListLiquidaciones } from "@/api/generated/debt/debt";
import { useListExpenses } from "@/api/generated/expenses/expenses";
import { useGetFinancialSummary } from "@/api/generated/incomes-outputs/incomes-outputs";
import type { ListPaymentsParams } from "@/api/generated/models";
import { useListPayments } from "@/api/generated/payments/payments";
import { useConsorcio } from "@/features/layout/ConsorcioContext";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardGrid } from "./DashboardGrid";
import { IncomeExpenseCard } from "./IncomeExpenseCard";
import { MetricCard } from "./MetricCard";
import { RecentActivityFeed } from "./RecentActivityFeed";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const CARD_SKELETON_KEYS = ["sc-1", "sc-2", "sc-3", "sc-4", "sc-5", "sc-6"] as const;

function formatMoney(amount: string, currency?: string): string {
  const value = Number.parseFloat(amount || "0");
  if (Number.isNaN(value)) return "$ 0,00";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency || "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPeriod(code: string): string {
  const year = code.slice(0, 4);
  const monthIdx = Number.parseInt(code.slice(4, 6), 10) - 1;
  const month = MONTHS[monthIdx];
  if (!month) return code;
  return `${month} ${year}`;
}

function collectionRateColor(rate: number): string {
  if (rate >= 80) return "text-green-700";
  if (rate >= 50) return "text-yellow-600";
  return "text-red-600";
}

function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedId, consorcios } = useConsorcio();

  const consorcioId = selectedId ?? consorcios[0]?.id ?? "";
  const urlPeriod = searchParams.get("period_code") ?? "";

  const liquidacionesQuery = useListLiquidaciones(
    consorcioId ? { consorcio_id: consorcioId } : undefined,
  );

  const paymentsParams: ListPaymentsParams = { consorcio_id: consorcioId };
  const paymentsQuery = useListPayments(paymentsParams, {
    query: { enabled: !!consorcioId },
  });

  const expensesQuery = useListExpenses(
    consorcioId
      ? { consorcio_id: consorcioId, type: "EXTRAORDINARIA", status: "PENDING" }
      : undefined,
    { query: { enabled: !!consorcioId } },
  );

  const defaultPeriod = useMemo(() => {
    const liquidaciones = liquidacionesQuery.data?.liquidaciones ?? [];
    if (!liquidaciones.length) return "";
    const firstOpen = liquidaciones.find((l) => l.status === "DRAFT" || l.status === "ISSUED");
    if (urlPeriod) return urlPeriod;
    if (firstOpen) return firstOpen.period_code.code;
    const sorted = [...liquidaciones].sort((a, b) =>
      b.period_code.code.localeCompare(a.period_code.code),
    );
    return sorted[0]?.period_code.code ?? "";
  }, [liquidacionesQuery.data, urlPeriod]);

  const selectedPeriod = urlPeriod || defaultPeriod;

  const summaryQuery = useGetFinancialSummary(
    { code: selectedPeriod },
    { consorcio_id: consorcioId },
    { query: { enabled: !!selectedPeriod && !!consorcioId } },
  );

  const allPeriods = useMemo(() => {
    const liquidaciones = liquidacionesQuery.data?.liquidaciones ?? [];
    const codes = new Set(liquidaciones.map((l) => l.period_code.code));
    return [...codes].sort((a, b) => b.localeCompare(a));
  }, [liquidacionesQuery.data]);

  const metrics = useMemo(() => {
    const liquidaciones = liquidacionesQuery.data?.liquidaciones ?? [];
    const payments = paymentsQuery.data ?? [];
    const expenses = expensesQuery.data ?? [];

    const activeLiquidaciones = liquidaciones.filter(
      (l) => l.status === "DRAFT" || l.status === "ISSUED",
    );
    const totalDebt = activeLiquidaciones.reduce(
      (s, l) => s + Number.parseFloat(l.current_balance.amount || "0"),
      0,
    );
    const activeCount = activeLiquidaciones.length;

    const totalPaid = payments
      .filter((p) => p.status === "ACTIVE")
      .reduce((s, p) => s + Number.parseFloat(p.amount.amount || "0"), 0);
    const rate = totalDebt + totalPaid > 0 ? (totalPaid / (totalDebt + totalPaid)) * 100 : 0;

    const pendingCount = expenses.length;

    return { totalDebt, activeCount, totalPaid, rate, pendingCount };
  }, [liquidacionesQuery.data, paymentsQuery.data, expensesQuery.data]);

  const queriesLoading =
    liquidacionesQuery.isLoading ||
    (paymentsQuery.isLoading && paymentsQuery.fetchStatus !== "idle") ||
    expensesQuery.isLoading;

  const queriesAllFailed =
    liquidacionesQuery.isError &&
    paymentsQuery.isError &&
    expensesQuery.isError &&
    (summaryQuery.isError || !selectedPeriod);

  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams);
    if (period) {
      params.set("period_code", period);
    } else {
      params.delete("period_code");
    }
    setSearchParams(params, { replace: true });
  };

  if (!consorcioId) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-500 text-lg">
        Seleccione un consorcio para ver el panel.
      </div>
    );
  }

  if (queriesAllFailed) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-neutral-500 text-lg">
          No se pudieron cargar los datos del panel. Verifique su conexión.
        </p>
        <button
          type="button"
          onClick={() => {
            liquidacionesQuery.refetch();
            paymentsQuery.refetch();
            expensesQuery.refetch();
            if (selectedPeriod) summaryQuery.refetch();
          }}
          className="text-sm font-medium text-neutral-700 underline hover:text-neutral-900"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const hasAnyData =
    (liquidacionesQuery.data?.liquidaciones.length ?? 0) > 0 ||
    (paymentsQuery.data?.length ?? 0) > 0 ||
    (expensesQuery.data?.length ?? 0) > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Panel de Control</h1>
        {allPeriods.length > 0 && (
          <select
            aria-label="Seleccionar período"
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="h-9 w-48 rounded-md border border-neutral-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
          >
            {allPeriods.map((code) => (
              <option key={code} value={code}>
                {formatPeriod(code)}
              </option>
            ))}
          </select>
        )}
      </div>

      {queriesLoading && !hasAnyData ? (
        <DashboardGrid>
          {CARD_SKELETON_KEYS.map((key) => (
            <MetricCard key={key} title="" loading />
          ))}
        </DashboardGrid>
      ) : (
        <DashboardGrid>
          <MetricCard
            title="Deuda Total"
            value={formatMoney(metrics.totalDebt.toFixed(2))}
            description={`${metrics.activeCount} liquidacion${metrics.activeCount === 1 ? "" : "es"} activa${metrics.activeCount === 1 ? "" : "s"}`}
            color={metrics.totalDebt > 0 ? "text-neutral-900" : "text-neutral-400"}
            onClick={metrics.totalDebt > 0 ? () => navigate("/debt") : undefined}
            empty={!hasAnyData}
            emptyMessage="Sin liquidaciones generadas."
            error={liquidacionesQuery.isError}
            onRetry={() => liquidacionesQuery.refetch()}
          />

          <MetricCard
            title="Tasa de Cobranza"
            value={`${metrics.rate.toFixed(1)}%`}
            color={collectionRateColor(metrics.rate)}
            empty={!hasAnyData}
            emptyMessage="Sin datos de cobranza."
            error={paymentsQuery.isError || liquidacionesQuery.isError}
            onRetry={() => {
              liquidacionesQuery.refetch();
              paymentsQuery.refetch();
            }}
          />

          <MetricCard
            title="Pendientes de Aprobación"
            value={String(metrics.pendingCount)}
            color={metrics.pendingCount > 0 ? "text-yellow-600" : "text-green-700"}
            onClick={
              metrics.pendingCount > 0
                ? () => navigate("/expenses?type=EXTRAORDINARIA&status=PENDING")
                : undefined
            }
            empty={
              expensesQuery.isSuccess && (expensesQuery.data?.length ?? 0) === 0
            }
            emptyMessage="Sin aprobaciones pendientes."
            error={expensesQuery.isError}
            onRetry={() => expensesQuery.refetch()}
          />

          <MetricCard
            title="Liquidaciones Activas"
            value={String(metrics.activeCount)}
            description={
              metrics.activeCount > 0
                ? `${metrics.activeCount} de ${liquidacionesQuery.data?.liquidaciones.length ?? 0}`
                : undefined
            }
            color={metrics.activeCount > 0 ? "text-neutral-900" : "text-neutral-400"}
            empty={!hasAnyData}
            emptyMessage="Sin liquidaciones."
            error={liquidacionesQuery.isError}
            onRetry={() => liquidacionesQuery.refetch()}
          />

          <IncomeExpenseCard
            summary={summaryQuery.data}
            loading={summaryQuery.isLoading || summaryQuery.fetchStatus === "fetching"}
            error={summaryQuery.isError}
            onRetry={() => summaryQuery.refetch()}
          />

          <RecentActivityFeed
            payments={paymentsQuery.data ?? []}
            loading={paymentsQuery.isLoading}
          />
        </DashboardGrid>
      )}
    </div>
  );
}

export { DashboardPage };
