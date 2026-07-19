import type { PaymentMethod } from "@/api/generated/models";
import { getListPaymentsQueryKey, useCreatePayment } from "@/api/generated/payments/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsorcio } from "@/features/layout/ConsorcioContext";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import { paymentKeys } from "./queryKeys";

interface PaymentCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function PaymentCreateModal({ open, onOpenChange, onSuccess }: PaymentCreateModalProps) {
  const { selectedId, consorcios } = useConsorcio();
  const queryClient = useQueryClient();
  const [unitId, setUnitId] = useState("");
  const [periodCode, setPeriodCode] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("TRANSFER");
  const [voucherNumber, setVoucherNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCreatePayment();

  if (!open) return null;

  const consorcioId = selectedId ?? consorcios[0]?.id ?? "";
  const showVoucherField = method === "CASH";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId.trim() || !periodCode.trim()) {
      setError("La unidad funcional y el periodo son requeridos.");
      return;
    }
    const parsedAmount = Number.parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("El monto debe ser mayor a 0.");
      return;
    }
    setError(null);
    try {
      await createPayment.mutateAsync({
        data: {
          consorcio_id: consorcioId,
          unit_id: unitId,
          period_code: { code: periodCode },
          payment_date: new Date().toISOString().slice(0, 10),
          amount: { amount: parsedAmount.toFixed(2), currency: "ARS" },
          method,
          has_voucher: showVoucherField ? voucherNumber.trim().length > 0 : true,
          ...(showVoucherField && voucherNumber.trim()
            ? { voucher_ref: voucherNumber.trim() }
            : {}),
        },
      });
      queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      setUnitId("");
      setPeriodCode("");
      setAmount("");
      setMethod("TRANSFER");
      setVoucherNumber("");
      onSuccess();
    } catch {
      setError("No se pudo registrar el pago.");
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
        aria-label="Registrar Pago"
        className="relative z-50 w-full max-w-md rounded-lg border bg-white p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Registrar Pago</h2>
          <Button variant="ghost" size="sm" aria-label="Cerrar" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pay-unit">ID Unidad Funcional</Label>
            <Input
              id="pay-unit"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              placeholder="UUID de la unidad funcional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-period">Periodo (YYYYMM)</Label>
            <Input
              id="pay-period"
              value={periodCode}
              onChange={(e) => setPeriodCode(e.target.value)}
              placeholder="202606"
              maxLength={6}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-amount">Monto (ARS)</Label>
            <Input
              id="pay-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-method">Medio de pago</Label>
            <select
              id="pay-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
            >
              <option value="TRANSFER">Transferencia</option>
              <option value="CASH">Efectivo</option>
              <option value="DEPOSIT">Depósito</option>
              <option value="MERCADOPAGO">MercadoPago</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
          {showVoucherField && (
            <div className="space-y-1.5">
              <Label htmlFor="pay-voucher">Numero de comprobante</Label>
              <Input
                id="pay-voucher"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                placeholder="Opcional para efectivo"
              />
            </div>
          )}
          <Button type="submit" disabled={createPayment.isPending} className="w-full">
            {createPayment.isPending ? "Registrando..." : "Registrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export { PaymentCreateModal };
