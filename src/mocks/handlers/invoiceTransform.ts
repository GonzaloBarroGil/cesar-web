import type {
  InvoiceData,
  NotaCreditoData,
  NotaDebitoData,
  ReciboData,
} from "@/mocks/fixtures/data";

function toInvoice(inv: InvoiceData) {
  return {
    id: inv.id,
    consorcio_id: inv.consorcio_id,
    tipo_comprobante:
      (
        {
          FacturaA: "001",
          FacturaB: "006",
          FacturaC: "011",
        } as Record<string, string>
      )[inv.tipo_comprobante] || "001",
    punto_venta: inv.punto_venta,
    numero_comprobante: inv.numero_comprobante,
    cae: inv.cae,
    cae_vencimiento: inv.cae_expiry,
    fecha_emision: inv.emision_date,
    fecha_vencimiento: null as string | null,
    emisor_cuit: "",
    emisor_razon_social: "",
    emisor_domicilio: "",
    emisor_condicion_iva: "RI" as "RI" | "MONOTRIBUTISTA" | "EXENTO" | "CF" | "NO_RESPONSABLE",
    emisor_iibb: null as string | null,
    emisor_inicio_actividades: "",
    receptor_cuit: inv.receptor_cuit,
    receptor_razon_social: inv.receptor_nombre,
    receptor_domicilio: null as string | null,
    receptor_condicion_iva: inv.receptor_iva as
      | "RI"
      | "MONOTRIBUTISTA"
      | "EXENTO"
      | "CF"
      | "NO_RESPONSABLE",
    items: inv.items.map((line, idx) => ({
      id: "" as string,
      invoice_id: inv.id,
      orden: idx,
      descripcion: line.description,
      cantidad: line.cantidad,
      unidad_medida: "unidad",
      precio_unitario: line.precio_unitario,
      subtotal: line.subtotal,
      alicuota_iva: Number.parseFloat(line.iva_rate) as 0 | 10.5 | 21 | 27,
      importe_iva: line.iva_amount,
    })),
    neto_gravado_21: inv.neto,
    iva_21: inv.iva,
    neto_gravado_105: { amount: "0.00", currency: "ARS" as string | undefined },
    iva_105: { amount: "0.00", currency: "ARS" as string | undefined },
    neto_gravado_27: { amount: "0.00", currency: "ARS" as string | undefined },
    iva_27: { amount: "0.00", currency: "ARS" as string | undefined },
    neto_exento: { amount: "0.00", currency: "ARS" as string | undefined },
    neto_no_gravado: { amount: "0.00", currency: "ARS" as string | undefined },
    otros_impuestos: [] as {
      id: string;
      nombre: string;
      alicuota: number;
      importe: { amount: string; currency?: string };
    }[],
    importe_total: inv.total,
    iva_contenido: inv.iva_contenido,
    qr_code: inv.qr_code,
    adicionales_rg: inv.adicionales_rg as Record<string, string>,
    leyenda: null as string | null,
    status:
      ({ ACTIVE: "Activa", ANULADA: "Anulada" } as Record<string, string>)[inv.status] || "Activa",
    hash: inv.hash,
    version: 1,
    created_at: inv.created_at,
    created_by: "" as string,
    tombstone: inv.tombstone,
  };
}

function toInvoiceResponse(inv: InvoiceData) {
  return { data: toInvoice(inv) };
}

function toNotaCreditoResponse(nc: NotaCreditoData) {
  return {
    data: {
      invoice: {
        id: "" as string,
        consorcio_id: nc.consorcio_id,
        tipo_comprobante: "001" as string,
        punto_venta: nc.punto_venta,
        numero_comprobante: nc.numero_comprobante,
        cae: nc.cae,
        cae_vencimiento: nc.cae_expiry,
        fecha_emision: nc.emision_date,
        fecha_vencimiento: null as string | null,
        emisor_cuit: "",
        emisor_razon_social: "",
        emisor_domicilio: "",
        emisor_condicion_iva: "RI" as string,
        emisor_iibb: null as string | null,
        emisor_inicio_actividades: "",
        receptor_cuit: null as string | null,
        receptor_razon_social: null as string | null,
        receptor_domicilio: null as string | null,
        receptor_condicion_iva: "CF" as string,
        items: [] as Record<string, unknown>[],
        neto_gravado_21: { amount: "0.00", currency: "ARS" as string | undefined },
        iva_21: { amount: "0.00", currency: "ARS" as string | undefined },
        neto_gravado_105: { amount: "0.00", currency: "ARS" as string | undefined },
        iva_105: { amount: "0.00", currency: "ARS" as string | undefined },
        neto_gravado_27: { amount: "0.00", currency: "ARS" as string | undefined },
        iva_27: { amount: "0.00", currency: "ARS" as string | undefined },
        neto_exento: { amount: "0.00", currency: "ARS" as string | undefined },
        neto_no_gravado: { amount: "0.00", currency: "ARS" as string | undefined },
        otros_impuestos: [] as Record<string, unknown>[],
        importe_total: nc.amount,
        iva_contenido: { amount: "0.00", currency: "ARS" as string | undefined },
        qr_code: "",
        adicionales_rg: {} as Record<string, string>,
        leyenda: null as string | null,
        status: "Activa" as string,
        hash: nc.hash,
        version: 1,
        created_at: nc.created_at,
        created_by: "" as string,
        tombstone: false,
      },
      comprobante_asociado_tipo: "001" as string,
      comprobante_asociado_punto_venta: nc.punto_venta,
      comprobante_asociado_numero: nc.numero_comprobante,
      motivo: nc.motivo as string,
    },
  };
}

function toNotaDebitoResponse(nd: NotaDebitoData) {
  return {
    data: {
      invoice: {
        id: "" as string,
        consorcio_id: nd.consorcio_id,
        tipo_comprobante: "001" as string,
        punto_venta: nd.punto_venta,
        numero_comprobante: nd.numero_comprobante,
        cae: nd.cae,
        cae_vencimiento: nd.cae_expiry,
        fecha_emision: nd.emision_date,
        fecha_vencimiento: null as string | null,
        emisor_cuit: "",
        emisor_razon_social: "",
        emisor_domicilio: "",
        emisor_condicion_iva: "RI" as string,
        emisor_iibb: null as string | null,
        emisor_inicio_actividades: "",
        receptor_cuit: null as string | null,
        receptor_razon_social: null as string | null,
        receptor_domicilio: null as string | null,
        receptor_condicion_iva: "CF" as string,
        items: [] as Record<string, unknown>[],
        neto_gravado_21: { amount: "0.00", currency: "ARS" as string | undefined },
        iva_21: { amount: "0.00", currency: "ARS" as string | undefined },
        neto_gravado_105: { amount: "0.00", currency: "ARS" as string | undefined },
        iva_105: { amount: "0.00", currency: "ARS" as string | undefined },
        neto_gravado_27: { amount: "0.00", currency: "ARS" as string | undefined },
        iva_27: { amount: "0.00", currency: "ARS" as string | undefined },
        neto_exento: { amount: "0.00", currency: "ARS" as string | undefined },
        neto_no_gravado: { amount: "0.00", currency: "ARS" as string | undefined },
        otros_impuestos: [] as Record<string, unknown>[],
        importe_total: nd.amount,
        iva_contenido: { amount: "0.00", currency: "ARS" as string | undefined },
        qr_code: "",
        adicionales_rg: {} as Record<string, string>,
        leyenda: null as string | null,
        status: "Activa" as string,
        hash: nd.hash,
        version: 1,
        created_at: nd.created_at,
        created_by: "" as string,
        tombstone: false,
      },
      comprobante_asociado_tipo: "001" as string,
      comprobante_asociado_punto_venta: nd.punto_venta,
      comprobante_asociado_numero: nd.numero_comprobante,
      motivo: nd.motivo as string,
    },
  };
}

function toReciboResponse(rec: ReciboData) {
  return {
    data: {
      id: rec.id,
      consorcio_id: rec.consorcio_id,
      tipo_comprobante: (rec.tipo === "ReciboB" ? "ReciboB" : "ReciboC") as string,
      punto_venta: 1,
      numero_comprobante: rec.numero,
      fecha_emision: rec.emision_date,
      fecha_pago: rec.emision_date,
      importe_pagado: rec.amount,
      medio_pago: rec.medio_pago,
      factura_asociada_id: rec.factura_id || undefined,
      liquidacion_ref: rec.liquidacion_id || undefined,
      status:
        ({ ACTIVE: "Activo", ANULADA: "Anulado" } as Record<string, string>)[rec.status] ||
        "Activo",
      hash: rec.hash,
      version: 1,
      created_at: rec.created_at,
      tombstone: false,
    },
  };
}

export { toInvoiceResponse, toNotaCreditoResponse, toNotaDebitoResponse, toReciboResponse };
