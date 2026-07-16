import type { AdjustmentReason, CreateNotaCreditoRequest, Invoice } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useState } from "react";
import type { InvoiceItemDraft } from "./InvoiceItems";
import { InvoiceItems, emptyItem, toLineRequests } from "./InvoiceItems";
import { InvoiceTypeBadge, formatComprobante } from "./InvoiceList";
import { InvoiceTotals, computeTotal } from "./InvoiceTotals";

type NotaMode = "NC" | "ND";

const NC_MOTIVOS: { value: AdjustmentReason; label: string }[] = [
  { value: "Return", label: "Devolucion" },
  { value: "Discount", label: "Descuento" },
  { value: "Cancellation", label: "Cancelacion" },
  { value: "Error", label: "Error de facturacion" },
  { value: "PostBillingDiscount", label: "Descuento posterior a facturacion" },
];

const ND_MOTIVOS: { value: AdjustmentReason; label: string }[] = [
  { value: "AdditionalCharge", label: "Cargo adicional" },
  { value: "PriceAdjustment", label: "Ajuste de precio" },
  { value: "Interest", label: "Intereses" },
  { value: "Other", label: "Otro" },
];

interface NotaFormProps {
  mode: NotaMode;
  invoice: Invoice;
  onSubmit: (data: CreateNotaCreditoRequest) => void;
  isSubmitting: boolean;
  error?: string | null;
}

function NotaForm({ mode, invoice, onSubmit, isSubmitting, error }: NotaFormProps) {
  const motivos = mode === "NC" ? NC_MOTIVOS : ND_MOTIVOS;
  const [motivo, setMotivo] = useState<AdjustmentReason>(motivos[0]?.value ?? "Other");
  const [fechaEmision, setFechaEmision] = useState(() => new Date().toISOString().slice(0, 10));
  const [cae, setCae] = useState("");
  const [caeVencimiento, setCaeVencimiento] = useState("");
  const [items, setItems] = useState<InvoiceItemDraft[]>([emptyItem()]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const disponible = Number.parseFloat(invoice.importe_total.amount || "0");
  const total = computeTotal(items, "A");

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fechaEmision) errors.fecha_emision = "La fecha de emision es requerida.";
    if (!/^[A-Za-z0-9]{10,}$/.test(cae)) {
      errors.cae = "El CAE debe ser alfanumerico de al menos 10 caracteres.";
    }
    if (!caeVencimiento) errors.cae_vencimiento = "El vencimiento del CAE es requerido.";
    if (
      items.length === 0 ||
      items.some((i) => !i.descripcion.trim() || Number.parseFloat(i.precio_unitario) <= 0)
    ) {
      errors.items = "Cada item debe tener descripcion y precio mayor a 0.";
    } else if (mode === "NC" && total > disponible) {
      errors.items = `El monto supera el disponible ($ ${disponible.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
      })}).`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      consorcio_id: invoice.consorcio_id,
      punto_venta: invoice.punto_venta,
      cae,
      cae_vencimiento: caeVencimiento,
      fecha_emision: fechaEmision,
      emisor_cuit: invoice.emisor_cuit,
      emisor_razon_social: invoice.emisor_razon_social,
      emisor_domicilio: invoice.emisor_domicilio,
      emisor_inicio_actividades: invoice.emisor_inicio_actividades,
      receptor_cuit: invoice.receptor_cuit ?? null,
      receptor_razon_social: invoice.receptor_razon_social ?? null,
      receptor_domicilio: invoice.receptor_domicilio ?? null,
      receptor_condicion_iva: invoice.receptor_condicion_iva,
      items: toLineRequests(items),
      otros_impuestos: [],
      adicionales_rg: {},
      qr_code: `https://qr.afip.gob.ar?cae=${cae}`,
      motivo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold">
        {mode === "NC" ? "Nueva Nota de Credito" : "Nueva Nota de Debito"}
      </h1>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <Card>
        <CardContent className="p-4">
          <span className="text-xs text-neutral-500">Comprobante asociado</span>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <InvoiceTypeBadge type={invoice.tipo_comprobante} />
              <span className="text-sm font-medium">
                {formatComprobante(invoice.punto_venta, invoice.numero_comprobante)}
              </span>
              <span className="text-sm text-neutral-500">
                {invoice.receptor_razon_social ?? "Consumidor Final"}
              </span>
            </div>
            <MoneyDisplay
              amount={{
                amount: invoice.importe_total.amount,
                currency: invoice.importe_total.currency ?? "ARS",
              }}
              className="text-sm font-semibold"
            />
          </div>
          {mode === "NC" && (
            <p className="text-xs text-neutral-500 mt-2">
              Monto disponible:{" "}
              <MoneyDisplay amount={{ amount: disponible.toFixed(2), currency: "ARS" }} />
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nota-motivo">Motivo</Label>
          <select
            id="nota-motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value as AdjustmentReason)}
            className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
          >
            {motivos.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nota-fecha-emision">Fecha de Emision</Label>
          <Input
            id="nota-fecha-emision"
            type="date"
            value={fechaEmision}
            onChange={(e) => setFechaEmision(e.target.value)}
          />
          {fieldErrors.fecha_emision && (
            <p className="text-xs text-red-600">{fieldErrors.fecha_emision}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nota-cae">CAE</Label>
          <Input
            id="nota-cae"
            value={cae}
            onChange={(e) => setCae(e.target.value)}
            placeholder="14 digitos"
            maxLength={14}
          />
          {fieldErrors.cae && <p className="text-xs text-red-600">{fieldErrors.cae}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nota-cae-vencimiento">Vencimiento CAE</Label>
          <Input
            id="nota-cae-vencimiento"
            type="date"
            value={caeVencimiento}
            onChange={(e) => setCaeVencimiento(e.target.value)}
          />
          {fieldErrors.cae_vencimiento && (
            <p className="text-xs text-red-600">{fieldErrors.cae_vencimiento}</p>
          )}
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold mb-2">
          Items (
          {mode === "NC"
            ? "reducen el comprobante original"
            : "incrementan el comprobante original"}
          )
        </legend>
        <InvoiceItems items={items} onChange={setItems} showIva />
        {fieldErrors.items && <p className="text-xs text-red-600">{fieldErrors.items}</p>}
        <InvoiceTotals items={items} variant="A" />
      </fieldset>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting
          ? "Emitiendo..."
          : mode === "NC"
            ? "Emitir Nota de Credito"
            : "Emitir Nota de Debito"}
      </Button>
    </form>
  );
}

export { NotaForm };
export type { NotaMode };
