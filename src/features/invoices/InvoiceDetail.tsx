import type { Invoice, Money } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { ivaRateLabel } from "./InvoiceItems";
import { InvoiceTypeBadge, formatComprobante } from "./InvoiceList";

function money(m: Money): { amount: string; currency: string } {
  return { amount: m.amount, currency: m.currency ?? "ARS" };
}

function BreakdownRow({ label, value }: { label: string; value: Money }) {
  if (Number.parseFloat(value.amount || "0") === 0) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-600">{label}</span>
      <MoneyDisplay amount={money(value)} className="text-sm" />
    </div>
  );
}

interface InvoiceDetailProps {
  invoice: Invoice;
  children?: React.ReactNode;
}

function InvoiceDetail({ invoice, children }: InvoiceDetailProps) {
  const anulada = invoice.status === "Anulada";
  const isFacturaA = invoice.tipo_comprobante === "001" || invoice.tipo_comprobante === "051";
  const isFacturaB = invoice.tipo_comprobante === "006";

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className={`text-xl font-semibold ${anulada ? "line-through" : ""}`}>
            {formatComprobante(invoice.punto_venta, invoice.numero_comprobante)}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <InvoiceTypeBadge type={invoice.tipo_comprobante} />
            <StatusBadge status={invoice.status} />
          </div>
        </div>
        <div className="text-right">
          <MoneyDisplay amount={money(invoice.importe_total)} className="text-xl font-semibold" />
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-neutral-500">Receptor</span>
            <p className="text-sm">{invoice.receptor_razon_social ?? "Consumidor Final"}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">CUIT Receptor</span>
            <p className="text-sm tabular-nums">{invoice.receptor_cuit ?? "—"}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Condicion IVA Receptor</span>
            <p className="text-sm">{invoice.receptor_condicion_iva}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Fecha de Emision</span>
            <p className="text-sm">{new Date(invoice.fecha_emision).toLocaleDateString("es-AR")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                Descripcion
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">Cant.</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">
                Precio Unit.
              </th>
              {isFacturaA && (
                <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">IVA</th>
              )}
              <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={`${item.orden}-${item.descripcion}`} className="border-b">
                <td className="px-4 py-3 text-sm">{item.descripcion}</td>
                <td className="px-4 py-3 text-sm text-right tabular-nums">{item.cantidad}</td>
                <td className="px-4 py-3 text-right">
                  <MoneyDisplay amount={money(item.precio_unitario)} className="text-sm" />
                </td>
                {isFacturaA && (
                  <td className="px-4 py-3 text-sm text-right">
                    {ivaRateLabel(item.alicuota_iva)}
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <MoneyDisplay amount={money(item.subtotal)} className="text-sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border p-4 space-y-2 max-w-sm ml-auto mb-6">
        {isFacturaA && (
          <>
            <BreakdownRow label="Neto Gravado 21%" value={invoice.neto_gravado_21} />
            <BreakdownRow label="IVA 21%" value={invoice.iva_21} />
            <BreakdownRow label="Neto Gravado 10,5%" value={invoice.neto_gravado_105} />
            <BreakdownRow label="IVA 10,5%" value={invoice.iva_105} />
            <BreakdownRow label="Neto Gravado 27%" value={invoice.neto_gravado_27} />
            <BreakdownRow label="IVA 27%" value={invoice.iva_27} />
            <BreakdownRow label="Exento" value={invoice.neto_exento} />
            <BreakdownRow label="No Gravado" value={invoice.neto_no_gravado} />
          </>
        )}
        {isFacturaB && (
          <BreakdownRow label="IVA Contenido (RG 5614/2024)" value={invoice.iva_contenido} />
        )}
        <div className="border-t pt-2 flex items-center justify-between font-semibold">
          <span className="text-sm">Total</span>
          <MoneyDisplay amount={money(invoice.importe_total)} className="text-sm" />
        </div>
      </div>

      {children}
    </div>
  );
}

export { InvoiceDetail };
