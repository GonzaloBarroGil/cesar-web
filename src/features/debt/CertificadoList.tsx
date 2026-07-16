import type { CertificadoDeuda } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CertificadoListProps {
  certificados: CertificadoDeuda[];
  count?: number;
  isLoading: boolean;
  error?: Error | null;
}

function CertificadoList({ certificados, isLoading, error }: CertificadoListProps) {
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar los certificados</p>
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

  if (certificados.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">No hay certificados de deuda.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-neutral-50">
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
              Deuda Total
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
              Unidad
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
              Vence
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
              Emitido
            </th>
            <th className="w-20" />
          </tr>
        </thead>
        <tbody>
          {certificados.map((c) => (
            <tr key={c.id} className="border-b hover:bg-neutral-50">
              <td className="px-4 py-3">
                <StatusBadge status={c.status} />
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/debt/certificados/${c.id}`}
                  className="text-sm font-medium text-neutral-900 hover:underline"
                >
                  <MoneyDisplay
                    amount={c.total_debt as { amount: string; currency: string }}
                    className="text-sm"
                  />
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                {c.unit_id.slice(0, 8)}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                {new Date(c.expires_at).toLocaleDateString("es-AR")}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                {new Date(c.issue_date).toLocaleDateString("es-AR")}
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/debt/certificados/${c.id}`}
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

export { CertificadoList };
