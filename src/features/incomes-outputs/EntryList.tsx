import type { IncomeOutputResponse } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CancelButton } from "./CancelButton";
import { DirectionBadge } from "./DirectionBadge";
import { MigrationBadge, subTypeLabel } from "./subTypes";

interface EntryListProps {
  entries: IncomeOutputResponse[];
  isLoading: boolean;
  error: Error | null;
}

function EntryList({ entries, isLoading, error }: EntryListProps) {
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar los movimientos</p>
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

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">No hay movimientos registrados.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-neutral-50">
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Fecha</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
              Descripción
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Dirección</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
              Tipo
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Monto</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
            <th className="w-32" />
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr
              key={e.id}
              onClick={() => navigate(`/incomes-outputs/${e.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter") navigate(`/incomes-outputs/${e.id}`);
              }}
              className={`border-b hover:bg-neutral-50 cursor-pointer ${
                e.tombstone ? "opacity-50" : ""
              }`}
            >
              <td className="px-4 py-3 text-sm text-neutral-600">{e.date}</td>
              <td className="px-4 py-3">
                <span className={`text-sm ${e.tombstone ? "line-through text-neutral-400" : ""}`}>
                  {e.description}
                </span>
              </td>
              <td className="px-4 py-3">
                <DirectionBadge direction={e.direction} />
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                    {subTypeLabel(e.sub_type)}
                  </span>
                  <MigrationBadge subType={e.sub_type} />
                </div>
              </td>
              <td className="px-4 py-3">
                <MoneyDisplay
                  amount={e.amount as { amount: string; currency: string }}
                  className="text-sm"
                />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={e.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/incomes-outputs/${e.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="text-xs text-neutral-500 hover:text-neutral-700"
                  >
                    Ver
                  </Link>
                  <CancelButton entryId={e.id} status={e.status} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { EntryList };
