import type { ExpenseAllocation } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";

interface ExpenseAllocationTableProps {
  allocations: ExpenseAllocation[];
}

const groupClasses: Record<string, string> = {
  MANTENIMIENTO: "bg-green-100 text-green-700",
  PERSONAL: "bg-blue-100 text-blue-700",
  OTROS: "bg-neutral-100 text-neutral-600",
};

function GroupBadge({ group }: { group: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded ${groupClasses[group] ?? "bg-neutral-100 text-neutral-600"}`}
    >
      {group}
    </span>
  );
}

function ExpenseAllocationTable({ allocations }: ExpenseAllocationTableProps) {
  if (allocations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Sin asignaciones</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-neutral-50">
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
              Descripcion
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Grupo</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
              Distribucion
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
              Porcentaje
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
              Parte de la UF
            </th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((a) => (
            <tr key={a.expense_id} className="border-b hover:bg-neutral-50">
              <td className="px-4 py-3 text-sm font-medium text-neutral-900">{a.description}</td>
              <td className="px-4 py-3">
                <GroupBadge group={a.expense_group} />
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                {a.distribution_type}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                {a.unit_percentage_applied.value}%
              </td>
              <td className="px-4 py-3">
                <MoneyDisplay
                  amount={a.unit_share as { amount: string; currency: string }}
                  className="text-sm"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { ExpenseAllocationTable };
