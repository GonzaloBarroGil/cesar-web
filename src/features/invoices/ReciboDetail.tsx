import type { Recibo } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { formatComprobante } from "./InvoiceList";

interface ReciboDetailProps {
  recibo: Recibo;
  children?: React.ReactNode;
}

function ReciboDetail({ recibo, children }: ReciboDetailProps) {
  const anulado = recibo.status === "Anulado";
  const tipoLabel = String(recibo.tipo_comprobante) === "015" ? "Recibo C" : "Recibo B";

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className={`text-xl font-semibold ${anulado ? "line-through" : ""}`}>
            {formatComprobante(recibo.punto_venta, recibo.numero_comprobante)}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
              {tipoLabel}
            </span>
            <StatusBadge status={recibo.status} />
          </div>
        </div>
        <div className="text-right">
          <MoneyDisplay
            amount={{
              amount: recibo.importe_pagado.amount,
              currency: recibo.importe_pagado.currency ?? "ARS",
            }}
            className="text-xl font-semibold"
          />
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-neutral-500">Fecha de Emision</span>
            <p className="text-sm">{new Date(recibo.fecha_emision).toLocaleDateString("es-AR")}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Fecha de Pago</span>
            <p className="text-sm">{new Date(recibo.fecha_pago).toLocaleDateString("es-AR")}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Medio de Pago</span>
            <p className="text-sm">{recibo.medio_pago}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Referencia</span>
            {recibo.factura_asociada_id ? (
              <p className="text-sm">
                Factura{" "}
                <Link
                  to={`/invoices/${recibo.factura_asociada_id}`}
                  className="text-neutral-900 hover:underline font-medium"
                >
                  {recibo.factura_asociada_id}
                </Link>
              </p>
            ) : recibo.liquidacion_ref ? (
              <p className="text-sm">Liquidacion {recibo.liquidacion_ref}</p>
            ) : (
              <p className="text-sm">—</p>
            )}
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}

export { ReciboDetail };
