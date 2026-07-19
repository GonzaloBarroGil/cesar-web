import type { PaymentResponse } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { NoVoucherWarning } from "./NoVoucherWarning";
import { PaymentMethodBadge } from "./PaymentMethodBadge";

interface PaymentListProps {
  payments: PaymentResponse[];
  isLoading: boolean;
  error: Error | null;
}

function VoucherCell({ payment }: { payment: PaymentResponse }) {
  if (payment.voucher_ref) {
    return <span className="text-sm text-neutral-600">{payment.voucher_ref}</span>;
  }
  if (payment.method === "CASH" && !payment.has_voucher) {
    return <NoVoucherWarning visible />;
  }
  return <span className="text-sm text-neutral-400">—</span>;
}

function PaymentList({ payments, isLoading, error }: PaymentListProps) {
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar los pagos</p>
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

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">No hay pagos registrados.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-neutral-50">
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Fecha</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
              Unidad
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Monto</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
              Medio de pago
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
              Comprobante
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden lg:table-cell">
              Recibo
            </th>
            <th className="w-20" />
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr
              key={p.id}
              onClick={() => navigate(`/payments/${p.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/payments/${p.id}`);
              }}
              className="border-b hover:bg-neutral-50 cursor-pointer"
            >
              <td className="px-4 py-3 text-sm text-neutral-600">{p.payment_date}</td>
              <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                {p.unit_id.slice(0, 8)}
              </td>
              <td className="px-4 py-3">
                <MoneyDisplay
                  amount={p.amount as { amount: string; currency: string }}
                  className="text-sm"
                />
              </td>
              <td className="px-4 py-3">
                <PaymentMethodBadge method={p.method} />
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <VoucherCell payment={p} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                {p.recibo_id ? (
                  <Link
                    to={`/invoices/recibos/${p.recibo_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-neutral-500 hover:text-neutral-700 hover:underline"
                  >
                    {p.recibo_id.slice(0, 8)}
                  </Link>
                ) : (
                  <span className="text-sm text-neutral-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/payments/${p.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { PaymentList };
