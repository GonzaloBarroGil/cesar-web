import type { Invoice } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const invoiceTypeConfig: Record<string, { label: string; className: string }> = {
  "001": { label: "Factura A", className: "bg-green-100 text-green-700" },
  "051": { label: "Factura A", className: "bg-green-100 text-green-700" },
  "006": { label: "Factura B", className: "bg-amber-100 text-amber-700" },
  "011": { label: "Factura C", className: "bg-neutral-100 text-neutral-700" },
};

function InvoiceTypeBadge({ type }: { type: string }) {
  const config = invoiceTypeConfig[type] ?? {
    label: type,
    className: "bg-neutral-100 text-neutral-700",
  };
  return <span className={`text-xs px-2 py-0.5 rounded ${config.className}`}>{config.label}</span>;
}

function formatComprobante(puntoVenta: number, numero: number): string {
  return `${String(puntoVenta).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;
}

interface InvoiceListProps {
  invoices: Invoice[];
  isLoading: boolean;
  error?: Error | null;
}

function InvoiceList({ invoices, isLoading, error }: InvoiceListProps) {
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar las facturas</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-neutral-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">No hay facturas emitidas</p>
        <Link to="/invoices/factura-a/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Emitir la primera
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-neutral-50">
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Tipo</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Numero</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
              CAE
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
              Receptor
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Total</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
              Fecha
            </th>
            <th className="w-20" />
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const anulada = inv.status === "Anulada";
            return (
              <tr
                key={inv.id}
                className={`border-b hover:bg-neutral-50 ${anulada ? "opacity-50" : ""}`}
              >
                <td className="px-4 py-3">
                  <InvoiceTypeBadge type={inv.tipo_comprobante} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/invoices/${inv.id}`}
                    className={`text-sm font-medium text-neutral-900 hover:underline ${
                      anulada ? "line-through" : ""
                    }`}
                  >
                    {formatComprobante(inv.punto_venta, inv.numero_comprobante)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell tabular-nums">
                  {inv.cae}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                  {inv.receptor_razon_social ?? "Consumidor Final"}
                </td>
                <td className="px-4 py-3">
                  <MoneyDisplay
                    amount={{
                      amount: inv.importe_total.amount,
                      currency: inv.importe_total.currency ?? "ARS",
                    }}
                    className="text-sm"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                  {new Date(inv.fecha_emision).toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/invoices/${inv.id}`}
                    className="text-xs text-neutral-500 hover:text-neutral-700"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { InvoiceList, InvoiceTypeBadge, formatComprobante };
