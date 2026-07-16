import type { Liquidacion } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface LiquidacionListProps {
  liquidaciones: Liquidacion[];
  count?: number;
  isLoading: boolean;
  error?: Error | null;
}

function LiquidacionList({ liquidaciones, isLoading, error }: LiquidacionListProps) {
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar las liquidaciones</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-neutral-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (liquidaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">No hay liquidaciones. Genere la primera.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-neutral-50">
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Numero</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
              Unidad
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
              Deuda Total
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
              Saldo Actual
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
              Periodo
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden lg:table-cell">
              Creado
            </th>
            <th className="w-20" />
          </tr>
        </thead>
        <tbody>
          {liquidaciones.map((l) => (
            <tr key={l.id} className="border-b hover:bg-neutral-50">
              <td className="px-4 py-3">
                <StatusBadge status={l.status} />
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/debt/${l.id}`}
                  className="text-sm font-medium text-neutral-900 hover:underline"
                >
                  {l.liquidacion_number}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                {l.unit_id.slice(0, 8)}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <MoneyDisplay
                  amount={l.total_debt as { amount: string; currency: string }}
                  className="text-sm"
                />
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <MoneyDisplay
                  amount={l.current_balance as { amount: string; currency: string }}
                  className="text-sm"
                  showColor
                />
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                {l.period_code.code}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600 hidden lg:table-cell">
                {new Date(l.created_at).toLocaleDateString("es-AR")}
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/debt/${l.id}`}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { LiquidacionList };
