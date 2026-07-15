import type { ExpenseResponse } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface ExpenseListProps {
  expenses: ExpenseResponse[];
  isLoading: boolean;
  error?: Error | null;
}

function ExpenseTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded ${
        type === "ORDINARIA" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {type === "ORDINARIA" ? "Ordinaria" : "Extraordinaria"}
    </span>
  );
}

function ExpenseList({ expenses, isLoading, error }: ExpenseListProps) {
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar los gastos</p>
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

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">No hay gastos registrados para este periodo</p>
        <Link to="/expenses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Registrar el primero
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-neutral-50">
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Tipo</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
              Descripcion
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
              Costo
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
              Periodo
            </th>
            <th className="w-20" />
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr
              key={e.id}
              className={`border-b hover:bg-neutral-50 ${e.tombstone ? "opacity-50" : ""}`}
            >
              <td className="px-4 py-3">
                <ExpenseTypeBadge type={e.expense_type} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={e.approval_status} />
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/expenses/${e.id}`}
                  className={`text-sm font-medium text-neutral-900 hover:underline ${
                    e.tombstone ? "line-through" : ""
                  }`}
                >
                  {e.item}
                </Link>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <MoneyDisplay
                  amount={e.cost as { amount: string; currency: string }}
                  className="text-sm"
                />
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                {e.period_code}
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/expenses/${e.id}`}
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

export { ExpenseList };
