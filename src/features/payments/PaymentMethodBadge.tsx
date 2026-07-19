const methodMap: Record<string, { label: string; className: string }> = {
  TRANSFER: { label: "Transferencia", className: "bg-green-100 text-green-700" },
  DEPOSIT: { label: "Depósito", className: "bg-blue-100 text-blue-700" },
  CASH: { label: "Efectivo", className: "bg-neutral-100 text-neutral-600" },
  MERCADOPAGO: { label: "MercadoPago", className: "bg-orange-100 text-orange-700" },
  OTHER: { label: "Otro", className: "bg-neutral-100 text-neutral-600" },
};

interface PaymentMethodBadgeProps {
  method: string;
}

function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  const config = methodMap[method] ?? {
    label: method,
    className: "bg-neutral-100 text-neutral-600",
  };

  return <span className={`text-xs px-2 py-0.5 rounded ${config.className}`}>{config.label}</span>;
}

export { PaymentMethodBadge };
