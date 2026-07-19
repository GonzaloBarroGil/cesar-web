import type { ListPaymentsParams, PaymentStatus } from "@/api/generated/models";
import { useListPayments } from "@/api/generated/payments/payments";
import { useConsorcio } from "@/features/layout/ConsorcioContext";
import { unidadesFuncionales } from "@/mocks/fixtures/data";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PaymentCreateModal } from "./PaymentCreateModal";
import { type FilterState, PaymentFilters } from "./PaymentFilters";
import { PaymentList } from "./PaymentList";
import { UnitBalanceCard } from "./UnitBalanceCard";
import { UnitHistoryTable } from "./UnitHistoryTable";

type Tab = "pagos" | "balances";

function PaymentListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const { selectedId, consorcios } = useConsorcio();

  const urlTab = searchParams.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(
    urlTab && ["pagos", "balances"].includes(urlTab) ? urlTab : "pagos",
  );

  const filters: FilterState = {
    period_code: searchParams.get("period_code") ?? "",
    status: searchParams.get("status") ?? "",
    unit_id: searchParams.get("unit_id") ?? "",
  };

  const consorcioId = selectedId ?? consorcios[0]?.id ?? "";

  const apiParams: ListPaymentsParams = { consorcio_id: consorcioId };
  if (filters.period_code) apiParams.period_code = { code: filters.period_code };
  if (filters.status) apiParams.status = filters.status as PaymentStatus;
  if (filters.unit_id) apiParams.unit_id = filters.unit_id;

  const { data: payments = [], isLoading, error } = useListPayments(apiParams);

  const handleFilterChange = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams);
    for (const key of ["period_code", "status", "unit_id"] as const) {
      if (newFilters[key]) {
        params.set(key, newFilters[key]);
      } else {
        params.delete(key);
      }
    }
    setSearchParams(params, { replace: true });
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    const next = new URLSearchParams(searchParams);
    if (t === "pagos") {
      next.delete("tab");
    } else {
      next.set("tab", t);
    }
    setSearchParams(next, { replace: true });
  };

  const tabs = [
    { key: "pagos" as const, label: "Pagos" },
    { key: "balances" as const, label: "Balances" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Pagos</h1>
      </div>

      <div className="border-b mb-6">
        <nav className="flex gap-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => switchTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "pagos" && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <PaymentFilters filters={filters} onFilterChange={handleFilterChange} />
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-800 h-9 px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Pago
            </button>
          </div>

          <PaymentList payments={payments} isLoading={isLoading} error={error as Error | null} />

          <PaymentCreateModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            onSuccess={() => setModalOpen(false)}
          />
        </>
      )}

      {tab === "balances" && (
        <div>
          <div className="space-y-1.5 mb-6">
            <label htmlFor="balance-unit" className="text-xs text-neutral-500 block">
              Unidad Funcional
            </label>
            <select
              id="balance-unit"
              aria-label="Seleccionar unidad funcional"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="h-9 w-60 rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
            >
              <option value="">Seleccionar unidad</option>
              {unidadesFuncionales.map((uf) => (
                <option key={uf.id} value={uf.id}>
                  {uf.uf_code}
                </option>
              ))}
            </select>
          </div>

          {selectedUnitId ? (
            <>
              <UnitBalanceCard unitId={selectedUnitId} />
              <UnitHistoryTable
                unitId={selectedUnitId}
                period_code={filters.period_code || undefined}
              />
            </>
          ) : (
            <p className="text-neutral-500 text-center py-8">
              Seleccione una unidad funcional para ver su balance.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export { PaymentListPage };
