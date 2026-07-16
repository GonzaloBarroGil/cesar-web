import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import type { InvoiceItemDraft } from "./InvoiceItems";
import { IVA_RATE_LABELS, lineIva, lineSubtotal } from "./InvoiceItems";

type InvoiceVariant = "A" | "B" | "C";

interface InvoiceTotalsProps {
  items: InvoiceItemDraft[];
  variant: InvoiceVariant;
}

function computeTotal(items: InvoiceItemDraft[], variant: InvoiceVariant): number {
  if (variant === "A") {
    return items.reduce((acc, item) => acc + lineSubtotal(item) + lineIva(item), 0);
  }
  return items.reduce((acc, item) => acc + lineSubtotal(item), 0);
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold" : ""}`}>
      <span className={`text-sm ${bold ? "text-neutral-900" : "text-neutral-600"}`}>{label}</span>
      <MoneyDisplay amount={{ amount: value.toFixed(2), currency: "ARS" }} className="text-sm" />
    </div>
  );
}

function InvoiceTotals({ items, variant }: InvoiceTotalsProps) {
  const total = computeTotal(items, variant);

  if (variant === "C") {
    return (
      <div className="rounded-lg border p-4 space-y-2 max-w-sm ml-auto">
        <Row label="Total" value={total} bold />
      </div>
    );
  }

  if (variant === "B") {
    const ivaContenido = items.reduce(
      (acc, item) => acc + lineSubtotal(item) - lineSubtotal(item) / 1.21,
      0,
    );
    return (
      <div className="rounded-lg border p-4 space-y-2 max-w-sm ml-auto">
        <Row label="Neto" value={total - ivaContenido} />
        <Row label="IVA Contenido (RG 5614/2024)" value={ivaContenido} />
        <Row label="Total" value={total} bold />
      </div>
    );
  }

  const gravadoRates = ["Veintiuno", "DiezComaCinco", "Veintisiete"] as const;
  const exento = items
    .filter((i) => i.alicuota_iva === "Exento" || i.alicuota_iva === "Cero")
    .reduce((acc, item) => acc + lineSubtotal(item), 0);

  return (
    <div className="rounded-lg border p-4 space-y-2 max-w-sm ml-auto">
      {gravadoRates.map((rate) => {
        const rateItems = items.filter((i) => i.alicuota_iva === rate);
        const neto = rateItems.reduce((acc, item) => acc + lineSubtotal(item), 0);
        const iva = rateItems.reduce((acc, item) => acc + lineIva(item), 0);
        if (neto === 0) return null;
        return (
          <div key={rate} className="space-y-2">
            <Row label={`Neto Gravado ${IVA_RATE_LABELS[rate]}`} value={neto} />
            <Row label={`IVA ${IVA_RATE_LABELS[rate]}`} value={iva} />
          </div>
        );
      })}
      {exento > 0 && <Row label="Exento / No Gravado" value={exento} />}
      <div className="border-t pt-2">
        <Row label="Total" value={total} bold />
      </div>
    </div>
  );
}

export { InvoiceTotals, computeTotal };
export type { InvoiceVariant };
