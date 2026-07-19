import type { PaymentHistoryEntry } from "@/api/generated/models";
import { useGetUnitPaymentHistory } from "@/api/generated/payments/payments";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { useConsorcio } from "@/features/layout/ConsorcioContext";
import { NoVoucherWarning } from "./NoVoucherWarning";
import { PaymentMethodBadge } from "./PaymentMethodBadge";

interface UnitHistoryTableProps {
  unitId: string;
  period_code?: string;
}

function UnitHistoryTable({ unitId, period_code }: UnitHistoryTableProps) {
  const { selectedId, consorcios } = useConsorcio();
  const consorcioId = selectedId ?? consorcios[0]?.id ?? "";

  const { data, isLoading, error, refetch } = useGetUnitPaymentHistory(unitId, {
    consorcio_id: consorcioId,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-neutral-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 mb-2">Error al cargar el historial</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  const history: PaymentHistoryEntry[] = data ?? [];
  const filtered = period_code ? history.filter((h) => h.period_code === period_code) : history;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">Sin historial de pagos para esta unidad.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-neutral-50">
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Fecha</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Monto</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
              Medio de pago
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
              Periodo
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((h) => (
            <tr key={h.payment_id} className="border-b hover:bg-neutral-50">
              <td className="px-4 py-3 text-sm text-neutral-600">{h.payment_date}</td>
              <td className="px-4 py-3">
                <MoneyDisplay
                  amount={h.amount as { amount: string; currency: string }}
                  className="text-sm"
                />
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <div className="flex items-center gap-1">
                  <PaymentMethodBadge method={h.method} />
                  <NoVoucherWarning visible={h.no_voucher_warning} />
                </div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={h.status} />
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                {h.period_code}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { UnitHistoryTable };
