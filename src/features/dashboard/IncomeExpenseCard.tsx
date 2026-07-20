import type { FinancialSummary } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared";

interface IncomeExpenseCardProps {
  summary?: FinancialSummary;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

function IncomeExpenseCard({ summary, loading, error, onRetry }: IncomeExpenseCardProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="h-4 w-32 bg-neutral-100 animate-pulse rounded mb-3" />
        <div className="space-y-2">
          <div className="h-5 w-24 bg-neutral-100 animate-pulse rounded" />
          <div className="h-5 w-24 bg-neutral-100 animate-pulse rounded" />
          <div className="h-5 w-20 bg-neutral-100 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-neutral-700 mb-1">Ingresos y Egresos</p>
        <p className="text-sm text-red-600">No se pudo cargar.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-xs font-medium text-red-700 underline hover:text-red-800"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-sm font-medium text-neutral-700 mb-1">Ingresos y Egresos</p>
        <p className="text-sm text-neutral-400">Sin movimientos en este período.</p>
      </div>
    );
  }

  const incomeAmount = {
    amount: summary.total_income.amount,
    currency: summary.total_income.currency ?? ("ARS" as const),
  };
  const outputAmount = {
    amount: summary.total_output.amount,
    currency: summary.total_output.currency ?? ("ARS" as const),
  };
  const netAmount = {
    amount: summary.net_flow.amount,
    currency: summary.net_flow.currency ?? ("ARS" as const),
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-sm font-medium text-neutral-700 mb-3">Ingresos y Egresos</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Ingresos</span>
          <MoneyDisplay amount={incomeAmount} className="text-sm font-medium text-green-700" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Egresos</span>
          <MoneyDisplay amount={outputAmount} className="text-sm font-medium text-red-600" />
        </div>
        <div className="border-t border-neutral-100 pt-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">Neto</span>
          <MoneyDisplay amount={netAmount} className="text-sm font-medium" showColor />
        </div>
      </div>
    </div>
  );
}

export { IncomeExpenseCard };
export type { IncomeExpenseCardProps };
