import type { Money } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { Card, CardContent } from "@/components/ui/card";

interface FinancialSummaryProps {
  summary: {
    previous_balance: Money;
    total_unit_expenses: Money;
    compensatory_interest: Money;
    punitive_interest: Money;
    round_off: Money;
    total_debt: Money;
    payments_applied: Money;
    current_balance: Money;
  };
}

function FinancialSummary({ summary }: FinancialSummaryProps) {
  const rows: { label: string; amount: Money }[] = [
    { label: "Saldo anterior", amount: summary.previous_balance },
    { label: "Gastos del periodo", amount: summary.total_unit_expenses },
    { label: "Interes compensatorio", amount: summary.compensatory_interest },
    { label: "Interes punitorio", amount: summary.punitive_interest },
    { label: "Redondeo", amount: summary.round_off },
    { label: "Deuda total", amount: summary.total_debt },
    { label: "Pagos aplicados", amount: summary.payments_applied },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-sm font-medium text-neutral-600 mb-3">Resumen Financiero</h2>
        <div className="divide-y">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-600">{row.label}</span>
              <MoneyDisplay
                amount={row.amount as { amount: string; currency: string }}
                className="text-sm"
              />
            </div>
          ))}
          <div className="flex items-center justify-between py-2 px-2 -mx-2 bg-neutral-50 rounded-md">
            <span className="text-sm font-semibold text-neutral-900">Saldo actual</span>
            <MoneyDisplay
              amount={summary.current_balance as { amount: string; currency: string }}
              className="text-sm font-semibold"
              showColor
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { FinancialSummary };
