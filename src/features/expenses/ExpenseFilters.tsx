import { Button } from "@/components/ui/button";

type ExpenseTypeFilter = "" | "ORDINARIA" | "EXTRAORDINARIA";
type ApprovalStatusFilter = "" | "PENDING" | "APPROVED" | "REJECTED";

interface FilterState {
  period_code: string;
  type: ExpenseTypeFilter;
  status: ApprovalStatusFilter;
}

interface ExpenseFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

function ExpenseFilters({ filters, onFilterChange }: ExpenseFiltersProps) {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <div className="space-y-1.5">
        <label htmlFor="filter-period" className="text-xs text-neutral-500 block">
          Periodo
        </label>
        <input
          id="filter-period"
          value={filters.period_code}
          onChange={(e) => handleChange("period_code", e.target.value)}
          placeholder="YYYYMM"
          maxLength={6}
          className="h-9 w-28 rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="filter-type" className="text-xs text-neutral-500 block">
          Tipo
        </label>
        <select
          id="filter-type"
          value={filters.type}
          onChange={(e) => handleChange("type", e.target.value)}
          className="h-9 rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
        >
          <option value="">Todos</option>
          <option value="ORDINARIA">Ordinaria</option>
          <option value="EXTRAORDINARIA">Extraordinaria</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="filter-status" className="text-xs text-neutral-500 block">
          Estado
        </label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
          className="h-9 rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendiente</option>
          <option value="APPROVED">Aprobado</option>
          <option value="REJECTED">Rechazado</option>
        </select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onFilterChange({ period_code: "", type: "", status: "" })}
      >
        Limpiar
      </Button>
    </div>
  );
}

export { ExpenseFilters };
export type { FilterState, ExpenseTypeFilter, ApprovalStatusFilter };
