import { useListExpenses } from "@/api/generated/expenses/expenses";
import type { ListExpensesParams } from "@/api/generated/models";
import { Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { ExpenseFilters, type FilterState } from "./ExpenseFilters";
import { ExpenseList } from "./ExpenseList";

function ExpensesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: FilterState = {
    period_code: searchParams.get("period_code") ?? "",
    type: (searchParams.get("type") as FilterState["type"]) ?? "",
    status: (searchParams.get("status") as FilterState["status"]) ?? "",
  };

  const apiParams: ListExpensesParams = {};
  if (filters.period_code) apiParams.period_code = filters.period_code;
  if (filters.type) apiParams.type = filters.type;
  if (filters.status) apiParams.status = filters.status;

  const { data: expenses = [], isLoading, error } = useListExpenses(apiParams);

  const handleFilterChange = (newFilters: FilterState) => {
    const params = new URLSearchParams();
    if (newFilters.period_code) params.set("period_code", newFilters.period_code);
    if (newFilters.type) params.set("type", newFilters.type);
    if (newFilters.status) params.set("status", newFilters.status);
    setSearchParams(params, { replace: true });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Expensas</h1>
        <div className="flex gap-2">
          <Link to="/expenses/providers">
            <span className="text-sm text-neutral-500 hover:text-neutral-700">Proveedores</span>
          </Link>
          <Link to="/expenses/concepts">
            <span className="text-sm text-neutral-500 hover:text-neutral-700">Conceptos</span>
          </Link>
          <Link to="/expenses/categories">
            <span className="text-sm text-neutral-500 hover:text-neutral-700">Categorias</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <ExpenseFilters filters={filters} onFilterChange={handleFilterChange} />
        <Link to="/expenses/new">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-800 h-9 px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </button>
        </Link>
      </div>

      <ExpenseList expenses={expenses} isLoading={isLoading} error={error as Error | null} />
    </div>
  );
}

export { ExpensesPage };
