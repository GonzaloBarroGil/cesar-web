import { http, HttpResponse } from "msw";
import { TORRE_NORTE_ID, payments } from "../fixtures/data";
import type { PaymentData } from "../fixtures/data";
import {
  toPaymentHistoryEntry,
  toPaymentResponse,
  toUnitBalanceResponse,
} from "./paymentTransform";

function error(status: number, code: string, message: string) {
  return HttpResponse.json({ error: { code, message } }, { status });
}

export const paymentsHandlers = [
  // Create payment
  http.post("http://localhost:3000/api/v1/payments", async ({ request }) => {
    const body = (await request.json()) as Partial<PaymentData>;
    const newP: PaymentData = {
      id: crypto.randomUUID(),
      consorcio_id: body.consorcio_id || TORRE_NORTE_ID,
      unidad_funcional_id: body.unidad_funcional_id || "",
      period_code: body.period_code || "202606",
      amount: body.amount || { amount: "0.00", currency: "ARS" },
      medio_pago: body.medio_pago || "TRANSFER",
      voucher_number: body.voucher_number || null,
      no_voucher_warning: body.medio_pago === "CASH" && !body.voucher_number,
      recibo_id: null,
      status: "ACTIVE",
      hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
      version: 1,
      created_at: new Date().toISOString(),
    };
    payments.push(newP);
    return HttpResponse.json(toPaymentResponse(newP), { status: 201 });
  }),

  // List payments
  http.get("http://localhost:3000/api/v1/payments", ({ request }) => {
    const url = new URL(request.url);
    const consorcio = url.searchParams.get("consorcio_id");
    const period = url.searchParams.get("period_code");
    let result = [...payments];
    if (consorcio) result = result.filter((p) => p.consorcio_id === consorcio);
    if (period) result = result.filter((p) => p.period_code === period);
    return HttpResponse.json(result.map(toPaymentResponse), { status: 200 });
  }),

  // Get payment detail
  http.get("http://localhost:3000/api/v1/payments/:id", ({ params }) => {
    const p = payments.find((p) => p.id === params.id);
    if (!p) return error(404, "NOT_FOUND", "Payment not found");
    return HttpResponse.json(toPaymentResponse(p), { status: 200 });
  }),

  // Reverse payment
  http.post("http://localhost:3000/api/v1/payments/:id/reverse", ({ params }) => {
    const payment = payments.find((p) => p.id === params.id);
    if (!payment) return error(404, "NOT_FOUND", "Payment not found");
    const reversal: PaymentData = {
      id: crypto.randomUUID(),
      consorcio_id: payment.consorcio_id,
      unidad_funcional_id: payment.unidad_funcional_id,
      period_code: payment.period_code,
      amount: payment.amount,
      medio_pago: payment.medio_pago,
      voucher_number: null,
      no_voucher_warning: false,
      recibo_id: null,
      status: "REVERSED",
      hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
      version: 1,
      created_at: new Date().toISOString(),
    };
    payment.status = "REVERSED";
    payments.push(reversal);
    return HttpResponse.json(toPaymentResponse(reversal), { status: 201 });
  }),

  // Unit balance
  http.get("http://localhost:3000/api/v1/payments/unit/:unitId/balance", ({ params }) => {
    const unitPayments = payments.filter(
      (p) => p.unidad_funcional_id === params.unitId && p.status === "ACTIVE",
    );
    const total = unitPayments.reduce((s, p) => s + Number.parseFloat(p.amount.amount || "0"), 0);
    return HttpResponse.json(toUnitBalanceResponse(params.unitId as string, total), {
      status: 200,
    });
  }),

  // Payment history
  http.get("http://localhost:3000/api/v1/payments/unit/:unitId/history", ({ params }) => {
    const history = payments
      .filter((p) => p.unidad_funcional_id === params.unitId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return HttpResponse.json(history.map(toPaymentHistoryEntry), { status: 200 });
  }),
];
