import { useGetEntry } from "@/api/generated/incomes-outputs/incomes-outputs";
import type { IncomeOutputResponse } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { useConsorcio } from "@/features/layout/ConsorcioContext";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CancelButton } from "./CancelButton";
import { EntryDetail } from "./EntryDetail";

type Tab = "general" | "versions";

function VersionHistory({ entry }: { entry: IncomeOutputResponse }) {
  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-neutral-50">
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Versión</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Fecha</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
              Hash
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr className={entry.tombstone ? "opacity-50" : ""}>
            <td className="px-4 py-3">
              <span className="text-sm font-medium">
                v{entry.version}
                <span className="ml-1 text-xs text-neutral-500">(actual)</span>
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-neutral-600">
              {new Date(entry.created_at).toLocaleDateString("es-AR")}
            </td>
            <td className="px-4 py-3 hidden sm:table-cell">
              <code className="text-xs text-neutral-500">{entry.hash.slice(0, 12)}...</code>
            </td>
            <td className="px-4 py-3">
              {entry.tombstone ? (
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 line-through">
                  Anulado
                </span>
              ) : (
                <span className="text-xs text-neutral-500">Activo</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedId, consorcios } = useConsorcio();
  const urlTab = searchParams.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(
    urlTab && ["general", "versions"].includes(urlTab) ? urlTab : "general",
  );

  const consorcioId = selectedId ?? consorcios[0]?.id ?? "";

  const {
    data: entry,
    isLoading,
    isError,
  } = useGetEntry(
    id ?? "",
    { consorcio_id: consorcioId },
    { query: { enabled: !!id && !!consorcioId } },
  );

  if (!id) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-neutral-100 animate-pulse rounded" />
        <div className="h-64 bg-neutral-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (isError || !entry) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-neutral-500 mb-4">Movimiento no encontrado</p>
        <Link to="/incomes-outputs">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Movimientos
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: "general" as const, label: "General" },
    { key: "versions" as const, label: "Historial" },
  ];

  return (
    <div>
      <Link
        to="/incomes-outputs"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Movimientos
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <CancelButton entryId={entry.id} status={entry.status} />
      </div>

      <div className="border-b mb-6">
        <nav className="flex gap-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                const next = new URLSearchParams(searchParams);
                if (t.key === "general") {
                  next.delete("tab");
                } else {
                  next.set("tab", t.key);
                }
                setSearchParams(next, { replace: true });
              }}
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

      {tab === "general" && <EntryDetail entry={entry} />}
      {tab === "versions" && <VersionHistory entry={entry} />}
    </div>
  );
}

export { EntryDetailPage };
