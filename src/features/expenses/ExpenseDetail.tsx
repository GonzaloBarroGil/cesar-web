import type { ExpenseResponse } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

interface ExpenseDetailProps {
  expense: ExpenseResponse;
  children?: React.ReactNode;
}

function ExpenseDetail({ expense, children }: ExpenseDetailProps) {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">{expense.item}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={expense.approval_status} />
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                expense.expense_type === "ORDINARIA"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {expense.expense_type === "ORDINARIA" ? "Ordinaria" : "Extraordinaria"}
            </span>
            {expense.tombstone && (
              <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 line-through">
                Anulado
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <MoneyDisplay
            amount={expense.cost as { amount: string; currency: string }}
            className="text-xl font-semibold"
          />
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-neutral-500">Periodo</span>
            <p className="text-sm">{expense.period_code}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Version</span>
            <p className="text-sm">{expense.version}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Termino</span>
            <p className="text-sm">
              {expense.term} de {expense.total_terms}
            </p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Creado</span>
            <p className="text-sm">{new Date(expense.created_at).toLocaleDateString("es-AR")}</p>
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}

export { ExpenseDetail };
