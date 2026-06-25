import { http, HttpResponse } from "msw";
import { liquidaciones, certifidadosDeuda, TORRE_NORTE_ID } from "../fixtures/data";
import type { LiquidacionData, CertificadoDeudaData } from "../fixtures/data";

function error(status: number, code: string, message: string) {
  return HttpResponse.json({ error: { code, message } }, { status });
}

export const debtHandlers = [
  // Generate liquidacion (single)
  http.post("http://localhost:3000/api/v1/debt/liquidaciones", async ({ request }) => {
    const body = (await request.json()) as { consorcio_id: string; period_code: string; unidad_funcional_id: string };
    const liq: LiquidacionData = {
      id: crypto.randomUUID(),
      consorcio_id: body.consorcio_id || TORRE_NORTE_ID,
      period_code: body.period_code || "202606",
      unidad_funcional_id: body.unidad_funcional_id || "",
      unit_code: "1A",
      status: "DRAFT",
      allocations: [],
      previous_balance: { amount: "0.00", currency: "ARS" },
      total_expenses: { amount: "0.00", currency: "ARS" },
      total_payments: { amount: "0.00", currency: "ARS" },
      punitive_interest: { amount: "0.00", currency: "ARS" },
      compensatory_interest: { amount: "0.00", currency: "ARS" },
      round_off: { amount: "0.00", currency: "ARS" },
      current_balance: { amount: "0.00", currency: "ARS" },
      qr_code: `https://qr.afip.gob.ar?liq=${body.period_code}`,
      hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
      version: 1,
      created_at: new Date().toISOString(),
      issued_at: null,
    };
    liquidaciones.push(liq);
    return HttpResponse.json(liq, { status: 201 });
  }),

  // Batch generate
  http.post("http://localhost:3000/api/v1/debt/liquidaciones/batch", async ({ request }) => {
    const body = (await request.json()) as { consorcio_id: string; period_code: string };
    const newLiqs: LiquidacionData[] = [];
    newLiqs.push({
      id: crypto.randomUUID(),
      consorcio_id: body.consorcio_id || TORRE_NORTE_ID,
      period_code: body.period_code || "202606",
      unidad_funcional_id: "550e8400-e29b-41d4-a716-446655440101",
      unit_code: "1A",
      status: "DRAFT",
      allocations: [],
      previous_balance: { amount: "0.00", currency: "ARS" },
      total_expenses: { amount: "0.00", currency: "ARS" },
      total_payments: { amount: "0.00", currency: "ARS" },
      punitive_interest: { amount: "0.00", currency: "ARS" },
      compensatory_interest: { amount: "0.00", currency: "ARS" },
      round_off: { amount: "0.00", currency: "ARS" },
      current_balance: { amount: "0.00", currency: "ARS" },
      qr_code: `https://qr.afip.gob.ar?liq=${body.period_code}-UF1A`,
      hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
      version: 1,
      created_at: new Date().toISOString(),
      issued_at: null,
    });
    liquidaciones.push(...newLiqs);
    return HttpResponse.json(newLiqs, { status: 201 });
  }),

  // List liquidaciones
  http.get("http://localhost:3000/api/v1/debt/liquidaciones", ({ request }) => {
    const url = new URL(request.url);
    const consorcio = url.searchParams.get("consorcio_id");
    const period = url.searchParams.get("period_code");
    let result = [...liquidaciones];
    if (consorcio) result = result.filter((l) => l.consorcio_id === consorcio);
    if (period) result = result.filter((l) => l.period_code === period);
    return HttpResponse.json(result, { status: 200 });
  }),

  // Get liquidacion detail
  http.get("http://localhost:3000/api/v1/debt/liquidaciones/:id", ({ params }) => {
    const liq = liquidaciones.find((l) => l.id === params.id);
    if (!liq) return error(404, "NOT_FOUND", "Liquidacion not found");
    return HttpResponse.json(liq, { status: 200 });
  }),

  // Issue liquidacion
  http.put("http://localhost:3000/api/v1/debt/liquidaciones/:id/issue", ({ params }) => {
    const idx = liquidaciones.findIndex((l) => l.id === params.id);
    if (idx === -1) return error(404, "NOT_FOUND", "Liquidacion not found");
    liquidaciones[idx]!.status = "ISSUED";
    liquidaciones[idx]!.issued_at = new Date().toISOString();
    return HttpResponse.json(liquidaciones[idx], { status: 200 });
  }),

  // PDF download (returns 501 — not implemented)
  http.get("http://localhost:3000/api/v1/debt/liquidaciones/:id/pdf", () => {
    return error(501, "NOT_IMPLEMENTED", "PDF generation not yet implemented");
  }),

  // Generate certificado
  http.post("http://localhost:3000/api/v1/debt/certificados", async ({ request }) => {
    const body = (await request.json()) as Partial<CertificadoDeudaData>;
    const cert: CertificadoDeudaData = {
      id: crypto.randomUUID(),
      consorcio_id: body.consorcio_id || TORRE_NORTE_ID,
      liquidacion_id: body.liquidacion_id || "",
      unidad_funcional_id: body.unidad_funcional_id || "",
      unit_code: body.unit_code || "",
      period_code: body.period_code || "",
      amount: body.amount || { amount: "0.00", currency: "ARS" },
      status: "VIGENTE",
      is_executive_title: false,
      consejo_approval: [],
      expires_at: new Date(Date.now() + 3 * 86400000).toISOString(),
      hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
      created_at: new Date().toISOString(),
      signed_at: null,
    };
    certifidadosDeuda.push(cert);
    return HttpResponse.json(cert, { status: 201 });
  }),

  // List certificados
  http.get("http://localhost:3000/api/v1/debt/certificados", ({ request }) => {
    const url = new URL(request.url);
    const unitId = url.searchParams.get("unit_id");
    let result = [...certifidadosDeuda];
    if (unitId) result = result.filter((c) => c.unidad_funcional_id === unitId);
    return HttpResponse.json(result, { status: 200 });
  }),

  // Get certificado detail
  http.get("http://localhost:3000/api/v1/debt/certificados/:id", ({ params }) => {
    const cert = certifidadosDeuda.find((c) => c.id === params.id);
    if (!cert) return error(404, "NOT_FOUND", "Certificado not found");
    return HttpResponse.json(cert, { status: 200 });
  }),

  // Sign certificado
  http.put("http://localhost:3000/api/v1/debt/certificados/:id/sign", ({ params }) => {
    const idx = certifidadosDeuda.findIndex((c) => c.id === params.id);
    if (idx === -1) return error(404, "NOT_FOUND", "Certificado not found");
    certifidadosDeuda[idx]!.is_executive_title = true;
    certifidadosDeuda[idx]!.signed_at = new Date().toISOString();
    certifidadosDeuda[idx]!.status = "EJECUTADO";
    return HttpResponse.json(certifidadosDeuda[idx], { status: 200 });
  }),
];
