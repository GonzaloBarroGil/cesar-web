import type { PaymentData } from "@/mocks/fixtures/data";

function toPaymentResponse(p: PaymentData) {
  return {
    id: p.id,
    consorcio_id: p.consorcio_id,
    unit_id: p.unidad_funcional_id,
    period_code: p.period_code,
    payment_date: p.created_at.slice(0, 10),
    amount: p.amount,
    method: p.medio_pago as "CASH" | "TRANSFER" | "DEPOSIT" | "MERCADOPAGO" | "OTHER",
    has_voucher: !p.no_voucher_warning,
    voucher_ref: p.voucher_number || undefined,
    recibo_id: p.recibo_id || undefined,
    notes: undefined as string | undefined,
    status: p.status as "ACTIVE" | "REVERSED",
    reversed_from: undefined as string | undefined,
    hash: p.hash,
    version: p.version,
    created_at: p.created_at,
    created_by: "" as string,
    tombstone: false,
  };
}

function toPaymentHistoryEntry(p: PaymentData) {
  return {
    payment_id: p.id,
    period_code: p.period_code,
    amount: p.amount,
    method: p.medio_pago as "CASH" | "TRANSFER" | "DEPOSIT" | "MERCADOPAGO" | "OTHER",
    payment_date: p.created_at.slice(0, 10),
    status: p.status as "ACTIVE" | "REVERSED",
    reversed_from: undefined as string | undefined,
    reversal_reason: undefined as string | undefined,
    no_voucher_warning: p.no_voucher_warning,
  };
}

function toUnitBalanceResponse(_unitId: string, totalPaid: number) {
  return {
    total_debt: { amount: "0.00", currency: "ARS" as string | undefined },
    total_paid: { amount: totalPaid.toFixed(2), currency: "ARS" as string | undefined },
    outstanding: { amount: (-totalPaid).toFixed(2), currency: "ARS" as string | undefined },
    overpayment: { amount: totalPaid.toFixed(2), currency: "ARS" as string | undefined },
  };
}

export { toPaymentResponse, toPaymentHistoryEntry, toUnitBalanceResponse };
