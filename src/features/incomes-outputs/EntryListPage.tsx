import { useListEntries } from "@/api/generated/incomes-outputs/incomes-outputs";
import type { FlowDirection, ListEntriesParams } from "@/api/generated/models";
import { Input } from "@/components/ui/input";
import { useConsorcio } from "@/features/layout/ConsorcioContext";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EntryCreateModal } from "./EntryCreateModal";
import { EntryList } from "./EntryList";

const directionTabs = [
  { key: "", label: "Todos" },
  { key: "INCOME", label: "Ingresos" },
  { key: "OUTPUT", label: "Egresos" },
];

function EntryListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const { selectedId, consorcios } = useConsorcio();

  const direction = searchParams.get("direction") ?? "";
  const periodCode = searchParams.get("period_code") ?? "";
  const dateFrom = searchParams.get("date_from") ?? "";
  const dateTo = searchParams.get("date_to") ?? "";

  const consorcioId = selectedId ?? consorcios[0]?.id ?? "";

  const apiParams: ListEntriesParams = { consorcio_id: consorcioId };
  if (direction) apiParams.direction = direction as FlowDirection;
  if (periodCode) apiParams.period_code = { code: periodCode };
  if (dateFrom) apiParams.date_from = dateFrom;
  if (dateTo) apiParams.date_to = dateTo;

  const { data: entries = [], isLoading, error } = useListEntries(apiParams);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Ingresos/Egresos</h1>
        <Link to="/incomes-outputs/summary">
          <span className="text-sm text-neutral-500 hover:text-neutral-700">Resumen</span>
        </Link>
      </div>

      <div className="border-b mb-4">
        <nav className="flex gap-4">
          {directionTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => updateParam("direction", t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                direction === t.key
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={periodCode}
            onChange={(e) => updateParam("period_code", e.target.value)}
            placeholder="Periodo (YYYYMM)"
            maxLength={6}
            className="w-40"
          />
          <Input
            type="date"
            aria-label="Desde"
            value={dateFrom}
            onChange={(e) => updateParam("date_from", e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            aria-label="Hasta"
            value={dateTo}
            onChange={(e) => updateParam("date_to", e.target.value)}
            className="w-40"
          />
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-800 h-9 px-4 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Movimiento
        </button>
      </div>

      <EntryList entries={entries} isLoading={isLoading} error={error as Error | null} />

      <EntryCreateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => setModalOpen(false)}
      />
    </div>
  );
}

export { EntryListPage };
