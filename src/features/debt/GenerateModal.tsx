import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";

type GenerateMode = "single" | "batch";

interface GenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (data: { period_code: string; unit_id: string }) => Promise<void>;
  onBatchGenerate: (data: { period_code: string }) => Promise<void>;
}

function GenerateModal({ open, onOpenChange, onGenerate, onBatchGenerate }: GenerateModalProps) {
  const [mode, setMode] = useState<GenerateMode>("single");
  const [periodCode, setPeriodCode] = useState("");
  const [unitId, setUnitId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  if (!open) return null;

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodCode.trim() || !unitId.trim()) {
      setError("El periodo y la unidad funcional son requeridos.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onGenerate({ period_code: periodCode, unit_id: unitId });
    } catch {
      setError("No se pudo generar la liquidacion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchConfirm = async () => {
    setShowBatchConfirm(false);
    if (!periodCode.trim()) {
      setError("El periodo es requerido.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onBatchGenerate({ period_code: periodCode });
    } catch {
      setError("No se pudieron generar las liquidaciones.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Cerrar"
        className="fixed inset-0 bg-black/50 cursor-default"
        onClick={() => onOpenChange(false)}
      />
      {/* biome-ignore lint/a11y/useSemanticElements: dialog used for overlay, <dialog> incompatible with this modal pattern */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Generar Liquidacion"
        className="relative z-50 w-full max-w-md rounded-lg border bg-white p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Generar Liquidacion</h2>
          <Button variant="ghost" size="sm" aria-label="Cerrar" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              mode === "single"
                ? "bg-neutral-900 border-neutral-900 text-white"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Unidad individual
          </button>
          <button
            type="button"
            onClick={() => setMode("batch")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              mode === "batch"
                ? "bg-neutral-900 border-neutral-900 text-white"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Todas las UF
          </button>
        </div>

        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 mb-4">{error}</div>}

        {mode === "single" ? (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="gen-period">Periodo (YYYYMM)</Label>
              <Input
                id="gen-period"
                value={periodCode}
                onChange={(e) => setPeriodCode(e.target.value)}
                placeholder="202606"
                maxLength={6}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gen-unit">ID Unidad Funcional</Label>
              <Input
                id="gen-unit"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                placeholder="UUID de la unidad funcional"
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Generando..." : "Generar"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="gen-batch-period">Periodo (YYYYMM)</Label>
              <Input
                id="gen-batch-period"
                value={periodCode}
                onChange={(e) => setPeriodCode(e.target.value)}
                placeholder="202606"
                maxLength={6}
              />
            </div>
            <p className="text-sm text-neutral-500">
              Se generaran liquidaciones para todas las unidades funcionales activas del consorcio.
            </p>
            <Button
              type="button"
              disabled={isSubmitting}
              className="w-full"
              onClick={() => {
                if (!periodCode.trim()) {
                  setError("El periodo es requerido.");
                  return;
                }
                setError(null);
                setShowBatchConfirm(true);
              }}
            >
              {isSubmitting ? "Generando..." : "Generar para todas las UF"}
            </Button>
            <ConfirmationDialog
              open={showBatchConfirm}
              onOpenChange={setShowBatchConfirm}
              title="Generar liquidaciones"
              description={`¿Generar liquidaciones para todas las unidades funcionales del periodo ${periodCode}?`}
              confirmLabel="Generar"
              variant="default"
              onConfirm={handleBatchConfirm}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export { GenerateModal };
