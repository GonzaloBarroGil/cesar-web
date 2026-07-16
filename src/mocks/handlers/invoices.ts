import { http, HttpResponse } from "msw";
import {
  TORRE_NORTE_CUIT,
  TORRE_NORTE_ID,
  invoices,
  notasCredito,
  notasDebito,
  recibos,
} from "../fixtures/data";
import type { InvoiceData, NotaCreditoData, NotaDebitoData, ReciboData } from "../fixtures/data";
import {
  toInvoiceResponse,
  toNotaCreditoResponse,
  toNotaDebitoResponse,
  toReciboResponse,
} from "./invoiceTransform";

function error(status: number, code: string, message: string) {
  return HttpResponse.json({ error: { code, message } }, { status });
}

export const invoicesHandlers = [
  // List invoices (list endpoint not in OAS spec — client-side filtered)
  http.get("http://localhost:3000/api/v1/invoices", () =>
    HttpResponse.json(
      invoices.map((i) => toInvoiceResponse(i).data),
      { status: 200 },
    ),
  ),

  // Create Factura A
  http.post("http://localhost:3000/api/v1/invoices/factura-a", async ({ request }) => {
    const body = (await request.json()) as Partial<InvoiceData>;
    const inv: InvoiceData = {
      id: crypto.randomUUID(),
      consorcio_id: body.consorcio_id || TORRE_NORTE_ID,
      tipo_comprobante: "FacturaA",
      punto_venta: body.punto_venta || 1,
      numero_comprobante: invoices.filter((i) => i.tipo_comprobante === "FacturaA").length + 1,
      cae: String(Math.floor(10000000000000 + Math.random() * 90000000000000)),
      cae_expiry: new Date(Date.now() + 10 * 86400000).toISOString(),
      emision_date: body.emision_date || new Date().toISOString().slice(0, 10),
      receptor_cuit: body.receptor_cuit || TORRE_NORTE_CUIT,
      receptor_nombre: body.receptor_nombre || "Consorcio",
      receptor_iva: body.receptor_iva || "RI",
      items: body.items || [],
      neto: body.neto || { amount: "0.00", currency: "ARS" },
      iva: body.iva || { amount: "0.00", currency: "ARS" },
      total: body.total || { amount: "0.00", currency: "ARS" },
      iva_contenido: body.iva_contenido || { amount: "0.00", currency: "ARS" },
      adicionales_rg: body.adicionales_rg || {},
      qr_code: `https://qr.afip.gob.ar?cae=${String(Math.floor(10000000000000 + Math.random() * 90000000000000))}`,
      status: "ACTIVE",
      hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
      tombstone: false,
      created_at: new Date().toISOString(),
    };
    invoices.push(inv);
    return HttpResponse.json(toInvoiceResponse(inv), { status: 201 });
  }),

  // Create Factura B
  http.post("http://localhost:3000/api/v1/invoices/factura-b", async ({ request }) => {
    const body = (await request.json()) as Partial<InvoiceData>;
    const inv: InvoiceData = {
      id: crypto.randomUUID(),
      consorcio_id: body.consorcio_id || TORRE_NORTE_ID,
      tipo_comprobante: "FacturaB",
      punto_venta: body.punto_venta || 1,
      numero_comprobante: invoices.filter((i) => i.tipo_comprobante === "FacturaB").length + 1,
      cae: String(Math.floor(10000000000000 + Math.random() * 90000000000000)),
      cae_expiry: new Date(Date.now() + 10 * 86400000).toISOString(),
      emision_date: body.emision_date || new Date().toISOString().slice(0, 10),
      receptor_cuit: body.receptor_cuit || null,
      receptor_nombre: body.receptor_nombre || "Consumidor Final",
      receptor_iva: body.receptor_iva || "CF",
      items: body.items || [],
      neto: body.neto || { amount: "0.00", currency: "ARS" },
      iva: body.iva || { amount: "0.00", currency: "ARS" },
      total: body.total || { amount: "0.00", currency: "ARS" },
      iva_contenido: body.iva_contenido || { amount: "0.00", currency: "ARS" },
      adicionales_rg: body.adicionales_rg || {},
      qr_code: `https://qr.afip.gob.ar?cae=${String(Math.floor(10000000000000 + Math.random() * 90000000000000))}`,
      status: "ACTIVE",
      hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
      tombstone: false,
      created_at: new Date().toISOString(),
    };
    invoices.push(inv);
    return HttpResponse.json(toInvoiceResponse(inv), { status: 201 });
  }),

  // Create Factura C
  http.post("http://localhost:3000/api/v1/invoices/factura-c", async ({ request }) => {
    const body = (await request.json()) as Partial<InvoiceData>;
    const inv: InvoiceData = {
      id: crypto.randomUUID(),
      consorcio_id: body.consorcio_id || TORRE_NORTE_ID,
      tipo_comprobante: "FacturaC",
      punto_venta: body.punto_venta || 1,
      numero_comprobante: invoices.filter((i) => i.tipo_comprobante === "FacturaC").length + 1,
      cae: String(Math.floor(10000000000000 + Math.random() * 90000000000000)),
      cae_expiry: new Date(Date.now() + 10 * 86400000).toISOString(),
      emision_date: body.emision_date || new Date().toISOString().slice(0, 10),
      receptor_cuit: null,
      receptor_nombre: body.receptor_nombre || "Consumidor Final",
      receptor_iva: body.receptor_iva || "CF",
      items: body.items || [],
      neto: body.neto || { amount: "0.00", currency: "ARS" },
      iva: body.iva || { amount: "0.00", currency: "ARS" },
      total: body.total || { amount: "0.00", currency: "ARS" },
      iva_contenido: body.iva_contenido || { amount: "0.00", currency: "ARS" },
      adicionales_rg: body.adicionales_rg || {},
      qr_code: `https://qr.afip.gob.ar?cae=${String(Math.floor(10000000000000 + Math.random() * 90000000000000))}`,
      status: "ACTIVE",
      hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
      tombstone: false,
      created_at: new Date().toISOString(),
    };
    invoices.push(inv);
    return HttpResponse.json(toInvoiceResponse(inv), { status: 201 });
  }),

  // Get invoice by ID
  http.get("http://localhost:3000/api/v1/invoices/:id", ({ params }) => {
    const inv = invoices.find((i) => i.id === params.id);
    if (!inv) return error(404, "NOT_FOUND", "Invoice not found");
    return HttpResponse.json(toInvoiceResponse(inv), { status: 200 });
  }),

  // Get invoice by CAE
  http.get("http://localhost:3000/api/v1/invoices/cae/:cae", ({ params }) => {
    const inv = invoices.find((i) => i.cae === params.cae);
    if (!inv) return error(404, "NOT_FOUND", "Invoice not found");
    return HttpResponse.json(toInvoiceResponse(inv), { status: 200 });
  }),

  // Annul invoice
  http.put("http://localhost:3000/api/v1/invoices/:id/anular", ({ params }) => {
    const inv = invoices.find((i) => i.id === params.id);
    if (!inv) return error(404, "NOT_FOUND", "Invoice not found");
    inv.status = "ANULADA";
    inv.tombstone = true;
    return HttpResponse.json(toInvoiceResponse(inv), { status: 200 });
  }),

  // Create Nota Crédito
  http.post(
    "http://localhost:3000/api/v1/invoices/:id/nota-credito",
    async ({ params, request }) => {
      const factura = invoices.find((i) => i.id === params.id);
      if (!factura) return error(404, "NOT_FOUND", "Invoice not found");
      const body = (await request.json()) as Partial<NotaCreditoData>;
      const nc: NotaCreditoData = {
        id: crypto.randomUUID(),
        consorcio_id: factura.consorcio_id,
        factura_id: factura.id,
        punto_venta: factura.punto_venta,
        numero_comprobante: notasCredito.length + 1,
        cae: String(Math.floor(10000000000000 + Math.random() * 90000000000000)),
        cae_expiry: new Date(Date.now() + 10 * 86400000).toISOString(),
        emision_date: body.emision_date || new Date().toISOString().slice(0, 10),
        motivo: body.motivo || "",
        amount: body.amount || { amount: "0.00", currency: "ARS" },
        status: "ACTIVE",
        hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
        created_at: new Date().toISOString(),
      };
      notasCredito.push(nc);
      return HttpResponse.json(toNotaCreditoResponse(nc), { status: 201 });
    },
  ),

  // Annul NC
  http.put("http://localhost:3000/api/v1/invoices/nota-credito/:id/anular", ({ params }) => {
    const nc = notasCredito.find((n) => n.id === params.id);
    if (!nc) return error(404, "NOT_FOUND", "Nota de Crédito not found");
    nc.status = "ANULADA";
    return HttpResponse.json(toNotaCreditoResponse(nc), { status: 200 });
  }),

  // Create Nota Débito
  http.post(
    "http://localhost:3000/api/v1/invoices/:id/nota-debito",
    async ({ params, request }) => {
      const factura = invoices.find((i) => i.id === params.id);
      if (!factura) return error(404, "NOT_FOUND", "Invoice not found");
      const body = (await request.json()) as Partial<NotaDebitoData>;
      const nd: NotaDebitoData = {
        id: crypto.randomUUID(),
        consorcio_id: factura.consorcio_id,
        factura_id: factura.id,
        punto_venta: factura.punto_venta,
        numero_comprobante: notasDebito.length + 1,
        cae: String(Math.floor(10000000000000 + Math.random() * 90000000000000)),
        cae_expiry: new Date(Date.now() + 10 * 86400000).toISOString(),
        emision_date: body.emision_date || new Date().toISOString().slice(0, 10),
        motivo: body.motivo || "",
        amount: body.amount || { amount: "0.00", currency: "ARS" },
        status: "ACTIVE",
        hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
        created_at: new Date().toISOString(),
      };
      notasDebito.push(nd);
      return HttpResponse.json(toNotaDebitoResponse(nd), { status: 201 });
    },
  ),

  // Annul ND
  http.put("http://localhost:3000/api/v1/invoices/nota-debito/:id/anular", ({ params }) => {
    const nd = notasDebito.find((n) => n.id === params.id);
    if (!nd) return error(404, "NOT_FOUND", "Nota de Débito not found");
    nd.status = "ANULADA";
    return HttpResponse.json(toNotaDebitoResponse(nd), { status: 200 });
  }),

  // Create Recibo
  http.post("http://localhost:3000/api/v1/recibos", async ({ request }) => {
    const body = (await request.json()) as Partial<ReciboData>;
    const rec: ReciboData = {
      id: crypto.randomUUID(),
      consorcio_id: body.consorcio_id || TORRE_NORTE_ID,
      tipo: body.tipo || "ReciboB",
      numero: recibos.length + 1,
      emision_date: body.emision_date || new Date().toISOString().slice(0, 10),
      amount: body.amount || { amount: "0.00", currency: "ARS" },
      factura_id: body.factura_id || null,
      liquidacion_id: body.liquidacion_id || null,
      medio_pago: body.medio_pago || "TRANSFER",
      status: "ACTIVE",
      hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
      created_at: new Date().toISOString(),
    };
    recibos.push(rec);
    return HttpResponse.json(toReciboResponse(rec), { status: 201 });
  }),

  // Get Recibo
  http.get("http://localhost:3000/api/v1/recibos/:id", ({ params }) => {
    const rec = recibos.find((r) => r.id === params.id) || invoices.find((i) => i.id === params.id);
    if (!rec) return error(404, "NOT_FOUND", "Recibo not found");
    if ("tipo_comprobante" in rec) {
      return HttpResponse.json(toInvoiceResponse(rec as InvoiceData), { status: 200 });
    }
    return HttpResponse.json(toReciboResponse(rec as ReciboData), { status: 200 });
  }),

  // Annul Recibo
  http.put("http://localhost:3000/api/v1/recibos/:id/anular", ({ params }) => {
    const rec = recibos.find((r) => r.id === params.id);
    if (!rec) return error(404, "NOT_FOUND", "Recibo not found");
    rec.status = "ANULADA";
    return HttpResponse.json(toReciboResponse(rec), { status: 200 });
  }),
];
