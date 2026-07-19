import type { PaymentResponse } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { NoVoucherWarning } from "./NoVoucherWarning";
import { PaymentMethodBadge } from "./PaymentMethodBadge";

interface PaymentDetailProps {
  payment: PaymentResponse;
}

function PaymentDetail({ payment }: PaymentDetailProps) {
  const showNoVoucher = payment.method === "CASH" && !payment.has_voucher;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Pago {payment.id.slice(0, 8)}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={payment.status} />
            <PaymentMethodBadge method={payment.method} />
            <NoVoucherWarning visible={showNoVoucher} />
          </div>
        </div>
        <div className="text-right">
          <MoneyDisplay
            amount={payment.amount as { amount: string; currency: string }}
            className="text-xl font-semibold"
          />
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-neutral-500">Periodo</span>
            <p className="text-sm">{payment.period_code}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Unidad Funcional</span>
            <p className="text-sm">{payment.unit_id.slice(0, 8)}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Fecha de pago</span>
            <p className="text-sm">{payment.payment_date}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Comprobante</span>
            <p className="text-sm">{payment.voucher_ref ?? "Sin comprobante"}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Recibo vinculado</span>
            {payment.recibo_id ? (
              <p className="text-sm">
                <Link
                  to={`/invoices/recibos/${payment.recibo_id}`}
                  className="text-neutral-900 hover:underline"
                >
                  {payment.recibo_id.slice(0, 8)}
                </Link>
              </p>
            ) : (
              <p className="text-sm text-neutral-400">—</p>
            )}
          </div>
          <div>
            <span className="text-xs text-neutral-500">Creado</span>
            <p className="text-sm">{new Date(payment.created_at).toLocaleDateString("es-AR")}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-xs text-neutral-500">Hash</span>
            <p className="text-xs font-mono break-all">{payment.hash}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { PaymentDetail };
