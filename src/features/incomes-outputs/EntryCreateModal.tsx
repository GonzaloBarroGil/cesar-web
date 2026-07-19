import {
  getListEntriesQueryKey,
  useCreateEntry,
} from "@/api/generated/incomes-outputs/incomes-outputs";
import { FlowSubType } from "@/api/generated/models";
import type { FlowDirection } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsorcio } from "@/features/layout/ConsorcioContext";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import { incomeOutputKeys } from "./queryKeys";
import { subTypeLabel, subTypesForDirection } from "./subTypes";

interface EntryCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function EntryCreateModal({ open, onOpenChange, onSuccess }: EntryCreateModalProps) {
  const { selectedId, consorcios } = useConsorcio();
  const queryClient = useQueryClient();
  const [direction, setDirection] = useState<FlowDirection>("INCOME");
  const [subType, setSubType] = useState<FlowSubType>(FlowSubType.INCOME_RENT);
  const [periodCode, setPeriodCode] = useState("");
  const [date, setDate] = useState(todayIso());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createEntry = useCreateEntry();

  if (!open) return null;

  const consorcioId = selectedId ?? consorcios[0]?.id ?? "";
  const showInvoiceField = subType === FlowSubType.INCOME_RENT;

  const periodWarning =
    /^\d{6}$/.test(periodCode) &&
    date.length === 10 &&
    (date.slice(0, 4) !== periodCode.slice(0, 4) || date.slice(5, 7) !== periodCode.slice(4, 6))
      ? `La fecha debe estar dentro del período ${periodCode}.`
      : null;

  const switchDirection = (dir: FlowDirection) => {
    setDirection(dir);
    setSubType(dir === "INCOME" ? FlowSubType.INCOME_RENT : FlowSubType.OUTPUT_SALARY_TEMP);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(periodCode)) {
      setError("El periodo (YYYYMM) es requerido.");
      return;
    }
    if (!date) {
      setError("La fecha es requerida.");
      return;
    }
    const parsedAmount = Number.parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("El monto debe ser mayor a 0.");
      return;
    }
    if (!description.trim()) {
      setError("La descripción es requerida.");
      return;
    }
    setError(null);
    try {
      await createEntry.mutateAsync({
        data: {
          consorcio_id: consorcioId,
          period_code: { code: periodCode },
          direction,
          sub_type: subType,
          date,
          amount: { amount: parsedAmount.toFixed(2), currency: "ARS" },
          description: description.trim(),
          ...(showInvoiceField && invoiceId.trim() ? { invoice_id: invoiceId.trim() } : {}),
        },
      });
      queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
      queryClient.invalidateQueries({ queryKey: incomeOutputKeys.lists() });
      setDirection("INCOME");
      setSubType(FlowSubType.INCOME_RENT);
      setPeriodCode("");
      setDate(todayIso());
      setAmount("");
      setDescription("");
      setInvoiceId("");
      onSuccess();
    } catch {
      setError("No se pudo registrar el movimiento.");
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
        aria-label="Nuevo Movimiento"
        className="relative z-50 w-full max-w-md rounded-lg border bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Nuevo Movimiento</h2>
          <Button variant="ghost" size="sm" aria-label="Cerrar" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-sm font-medium leading-none">Dirección</span>
            <div className="flex gap-2">
              <button
                type="button"
                aria-pressed={direction === "INCOME"}
                onClick={() => switchDirection("INCOME")}
                className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${
                  direction === "INCOME"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                Ingreso
              </button>
              <button
                type="button"
                aria-pressed={direction === "OUTPUT"}
                onClick={() => switchDirection("OUTPUT")}
                className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${
                  direction === "OUTPUT"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                Egreso
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="entry-subtype">Tipo</Label>
            <select
              id="entry-subtype"
              value={subType}
              onChange={(e) => setSubType(e.target.value as FlowSubType)}
              className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
            >
              {subTypesForDirection(direction).map((st) => (
                <option key={st} value={st}>
                  {subTypeLabel(st)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="entry-period">Periodo (YYYYMM)</Label>
            <Input
              id="entry-period"
              value={periodCode}
              onChange={(e) => setPeriodCode(e.target.value)}
              placeholder="202606"
              maxLength={6}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="entry-date">Fecha</Label>
            <Input
              id="entry-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="entry-amount">Monto (ARS)</Label>
            <Input
              id="entry-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="entry-description">Descripción</Label>
            <Input
              id="entry-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del movimiento"
              maxLength={1000}
            />
          </div>
          {showInvoiceField && (
            <div className="space-y-1.5">
              <Label htmlFor="entry-invoice">ID Factura (opcional)</Label>
              <Input
                id="entry-invoice"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="UUID de la factura vinculada"
              />
            </div>
          )}
          {periodWarning && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
              {periodWarning}
            </div>
          )}
          <Button type="submit" disabled={createEntry.isPending} className="w-full">
            {createEntry.isPending ? "Registrando..." : "Registrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export { EntryCreateModal };
