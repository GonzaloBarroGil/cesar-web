import { Button } from "@/components/ui/button";

interface FilterState {
  period_code: string;
  status: string;
  unit_id: string;
}

interface PaymentFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

function PaymentFilters({ filters, onFilterChange }: PaymentFiltersProps) {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
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
          <option value="ACTIVE">Activo</option>
          <option value="REVERSED">Revertido</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="filter-unit" className="text-xs text-neutral-500 block">
          Unidad Funcional
        </label>
        <input
          id="filter-unit"
          value={filters.unit_id}
          onChange={(e) => handleChange("unit_id", e.target.value)}
          placeholder="ID de unidad"
          className="h-9 w-40 rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onFilterChange({ period_code: "", status: "", unit_id: "" })}
      >
        Limpiar
      </Button>
    </div>
  );
}

export { PaymentFilters };
export type { FilterState };
