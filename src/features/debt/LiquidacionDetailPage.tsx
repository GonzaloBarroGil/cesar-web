import { useGetLiquidacion } from "@/api/generated/debt/debt";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Copy, QrCode } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ExpenseAllocationTable } from "./ExpenseAllocationTable";
import { FinancialSummary } from "./FinancialSummary";
import { IssueButton } from "./IssueButton";
import { LiquidacionDetail } from "./LiquidacionDetail";
import { PdfButton } from "./PdfButton";

type Tab = "general" | "asignaciones";

function LiquidacionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(
    urlTab && ["general", "asignaciones"].includes(urlTab) ? urlTab : "general",
  );
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError } = useGetLiquidacion(id ?? "", {
    query: { enabled: !!id },
  });

  if (!id) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-neutral-100 animate-pulse rounded" />
        <div className="h-64 bg-neutral-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  const liquidacion = data?.liquidacion;

  if (isError || !liquidacion) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-neutral-500 mb-4">Liquidacion no encontrada</p>
        <Link to="/debt">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Deuda
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: "general" as const, label: "General" },
    { key: "asignaciones" as const, label: "Asignaciones" },
  ];

  const handleCopyHash = async () => {
    await navigator.clipboard.writeText(liquidacion.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Link
        to="/debt"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Deuda
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <IssueButton liquidacionId={liquidacion.id} status={liquidacion.status} />
        <PdfButton liquidacionId={liquidacion.id} status={liquidacion.status} />
      </div>

      <LiquidacionDetail liquidacion={liquidacion}>
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

        {tab === "general" && (
          <div className="space-y-6">
            <FinancialSummary summary={liquidacion} />

            <Card>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-neutral-500">Codigo QR (DI-1146/24)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <QrCode className="h-8 w-8 text-neutral-400" />
                    <p className="text-sm break-all">{liquidacion.qr_code}</p>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Hash</span>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-mono">{liquidacion.hash.slice(0, 16)}...</p>
                    <Button variant="ghost" size="sm" onClick={handleCopyHash}>
                      <Copy className="h-4 w-4 mr-1" />
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {tab === "asignaciones" && (
          <ExpenseAllocationTable allocations={liquidacion.expenses_breakdown} />
        )}
      </LiquidacionDetail>
    </div>
  );
}

export { LiquidacionDetailPage };
