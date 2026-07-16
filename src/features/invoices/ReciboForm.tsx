import type { CreateReciboRequest } from "@/api/generated/models";
import { ReceiptType } from "@/api/generated/models";
import { IvaConditionSelect } from "@/components/shared/IvaConditionSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useState } from "react";

const MEDIOS_PAGO = ["EFECTIVO", "TRANSFERENCIA", "DEPOSITO", "MERCADOPAGO", "OTRO"] as const;

type ReferenceKind = "factura" | "liquidacion";

interface ReciboFormProps {
  onSubmit: (data: CreateReciboRequest) => void;
  isSubmitting: boolean;
  error?: string | null;
  initialFacturaId?: string;
}

function ReciboForm({ onSubmit, isSubmitting, error, initialFacturaId }: ReciboFormProps) {
  const [consorcioId, setConsorcioId] = useState("");
  const [consorcioIva, setConsorcioIva] = useState<string>("RI");
  const [puntoVenta, setPuntoVenta] = useState("1");
  const [fechaEmision, setFechaEmision] = useState(() => new Date().toISOString().slice(0, 10));
  const [fechaPago, setFechaPago] = useState(() => new Date().toISOString().slice(0, 10));
  const [importe, setImporte] = useState("");
  const [medioPago, setMedioPago] = useState<string>("TRANSFERENCIA");
  const [referenceKind, setReferenceKind] = useState<ReferenceKind>(
    initialFacturaId ? "factura" : "factura",
  );
  const [referenceId, setReferenceId] = useState(initialFacturaId ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isReciboB = consorcioIva === "RI" || consorcioIva === "MONOTRIBUTISTA";
  const tipoLabel = isReciboB ? "Recibo B" : "Recibo C";

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!consorcioId.trim()) errors.consorcio_id = "El consorcio es requerido.";
    if (!puntoVenta || Number.parseInt(puntoVenta, 10) < 1) {
      errors.punto_venta = "El punto de venta debe ser mayor a 0.";
    }
    if (!fechaEmision) errors.fecha_emision = "La fecha de emision es requerida.";
    if (!fechaPago) errors.fecha_pago = "La fecha de pago es requerida.";
    if (!importe || Number.parseFloat(importe) <= 0) {
      errors.importe = "El importe debe ser mayor a 0.";
    }
    if (!medioPago) errors.medio_pago = "El medio de pago es requerido.";
    if (!referenceId.trim()) {
      errors.reference = "Debe referenciar una factura o una liquidacion.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      consorcio_id: consorcioId,
      tipo_comprobante: isReciboB ? ReceiptType.NUMBER_9 : ReceiptType.NUMBER_015,
      punto_venta: Number.parseInt(puntoVenta, 10),
      fecha_emision: fechaEmision,
      fecha_pago: fechaPago,
      importe_pagado: { amount: Number.parseFloat(importe).toFixed(2), currency: "ARS" },
      medio_pago: medioPago,
      factura_asociada_id: referenceKind === "factura" ? referenceId : undefined,
      liquidacion_ref: referenceKind === "liquidacion" ? referenceId : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold mb-6">Nuevo Recibo</h1>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="space-y-1.5">
        <Label htmlFor="recibo-consorcio">ID Consorcio</Label>
        <Input
          id="recibo-consorcio"
          value={consorcioId}
          onChange={(e) => setConsorcioId(e.target.value)}
          placeholder="UUID del consorcio"
        />
        {fieldErrors.consorcio_id && (
          <p className="text-xs text-red-600">{fieldErrors.consorcio_id}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recibo-consorcio-iva">Condicion IVA del Consorcio</Label>
        <IvaConditionSelect
          id="recibo-consorcio-iva"
          value={consorcioIva}
          onChange={setConsorcioIva}
          className="w-full"
        />
        <p className="text-xs text-neutral-500">
          Tipo de comprobante: <span className="font-medium">{tipoLabel}</span>
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Referencia</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReferenceKind("factura")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              referenceKind === "factura"
                ? "bg-neutral-900 border-neutral-900 text-neutral-50"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Factura
          </button>
          <button
            type="button"
            onClick={() => setReferenceKind("liquidacion")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              referenceKind === "liquidacion"
                ? "bg-neutral-900 border-neutral-900 text-neutral-50"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Liquidacion
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recibo-referencia">
          {referenceKind === "factura" ? "ID Factura" : "ID Liquidacion"}
        </Label>
        <Input
          id="recibo-referencia"
          value={referenceId}
          onChange={(e) => setReferenceId(e.target.value)}
          placeholder={
            referenceKind === "factura" ? "UUID de la factura" : "UUID de la liquidacion"
          }
        />
        {fieldErrors.reference && <p className="text-xs text-red-600">{fieldErrors.reference}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recibo-punto-venta">Punto de Venta</Label>
        <Input
          id="recibo-punto-venta"
          type="number"
          min={1}
          max={65535}
          value={puntoVenta}
          onChange={(e) => setPuntoVenta(e.target.value)}
        />
        {fieldErrors.punto_venta && (
          <p className="text-xs text-red-600">{fieldErrors.punto_venta}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recibo-fecha-emision">Fecha de Emision</Label>
        <Input
          id="recibo-fecha-emision"
          type="date"
          value={fechaEmision}
          onChange={(e) => setFechaEmision(e.target.value)}
        />
        {fieldErrors.fecha_emision && (
          <p className="text-xs text-red-600">{fieldErrors.fecha_emision}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recibo-fecha-pago">Fecha de Pago</Label>
        <Input
          id="recibo-fecha-pago"
          type="date"
          value={fechaPago}
          onChange={(e) => setFechaPago(e.target.value)}
        />
        {fieldErrors.fecha_pago && <p className="text-xs text-red-600">{fieldErrors.fecha_pago}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recibo-importe">Importe Pagado (ARS)</Label>
        <Input
          id="recibo-importe"
          type="number"
          step="0.01"
          min="0"
          value={importe}
          onChange={(e) => setImporte(e.target.value)}
          placeholder="0.00"
        />
        {fieldErrors.importe && <p className="text-xs text-red-600">{fieldErrors.importe}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recibo-medio-pago">Medio de Pago</Label>
        <select
          id="recibo-medio-pago"
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
        >
          {MEDIOS_PAGO.map((m) => (
            <option key={m} value={m}>
              {m.charAt(0) + m.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        {fieldErrors.medio_pago && <p className="text-xs text-red-600">{fieldErrors.medio_pago}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? "Emitiendo..." : "Emitir Recibo"}
      </Button>
    </form>
  );
}

export { ReciboForm };
