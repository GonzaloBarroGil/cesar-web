import type { Invoice, InvoiceLine } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CaeQrDisplay } from "../CaeQrDisplay";
import { InvoiceDetail } from "../InvoiceDetail";

const mockItems: InvoiceLine[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440851",
    invoice_id: "550e8400-e29b-41d4-a716-446655440801",
    orden: 0,
    descripcion: "Mantenimiento ascensores",
    cantidad: 1,
    unidad_medida: "unidad",
    precio_unitario: { amount: "45000.00", currency: "ARS" },
    subtotal: { amount: "45000.00", currency: "ARS" },
    alicuota_iva: "Veintiuno",
    importe_iva: { amount: "9450.00", currency: "ARS" },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440852",
    invoice_id: "550e8400-e29b-41d4-a716-446655440801",
    orden: 1,
    descripcion: "Limpieza de tanques",
    cantidad: 2,
    unidad_medida: "unidad",
    precio_unitario: { amount: "10000.00", currency: "ARS" },
    subtotal: { amount: "20000.00", currency: "ARS" },
    alicuota_iva: "DiezComaCinco",
    importe_iva: { amount: "2100.00", currency: "ARS" },
  },
];

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "550e8400-e29b-41d4-a716-446655440801",
    consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
    tipo_comprobante: "001",
    punto_venta: 1,
    numero_comprobante: 1,
    cae: "12345678901234",
    cae_vencimiento: "2099-12-31",
    fecha_emision: "2026-06-05T00:00:00Z",
    fecha_vencimiento: null,
    emisor_cuit: "20123456786",
    emisor_razon_social: "Administracion Norte SA",
    emisor_domicilio: "Av. Corrientes 1234",
    emisor_condicion_iva: "RI",
    emisor_iibb: null,
    emisor_inicio_actividades: "2020-01-01",
    receptor_cuit: "20123456786",
    receptor_razon_social: "Consorcio Torre Norte",
    receptor_domicilio: "Av. Libertador 5678",
    receptor_condicion_iva: "RI",
    items: mockItems,
    neto_gravado_21: { amount: "45000.00", currency: "ARS" },
    iva_21: { amount: "9450.00", currency: "ARS" },
    neto_gravado_105: { amount: "20000.00", currency: "ARS" },
    iva_105: { amount: "2100.00", currency: "ARS" },
    neto_gravado_27: { amount: "0.00", currency: "ARS" },
    iva_27: { amount: "0.00", currency: "ARS" },
    neto_exento: { amount: "0.00", currency: "ARS" },
    neto_no_gravado: { amount: "0.00", currency: "ARS" },
    otros_impuestos: [],
    importe_total: { amount: "76550.00", currency: "ARS" },
    iva_contenido: { amount: "11550.00", currency: "ARS" },
    qr_code: "https://qr.afip.gob.ar?cae=12345678901234",
    adicionales_rg: {},
    leyenda: null,
    status: "Activa",
    hash: "a".repeat(64),
    version: 1,
    created_at: "2026-06-05T09:00:00Z",
    created_by: "550e8400-e29b-41d4-a716-446655440999",
    tombstone: false,
    ...overrides,
  };
}

describe("InvoiceDetail", () => {
  it("[@display] renders header with type badge and CAE", () => {
    const invoice = makeInvoice();

    render(
      <MemoryRouter>
        <InvoiceDetail invoice={invoice}>
          <CaeQrDisplay cae={invoice.cae} caeVencimiento={invoice.cae_vencimiento} />
        </InvoiceDetail>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "0001-00000001" })).toBeInTheDocument();
    expect(screen.getByText("Factura A")).toBeInTheDocument();
    expect(screen.getByText("Activa")).toBeInTheDocument();
    expect(screen.getByText("12345678901234")).toBeInTheDocument();
  });

  it("[@display] shows items table with quantities and IVA rates", () => {
    render(
      <MemoryRouter>
        <InvoiceDetail invoice={makeInvoice()} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Mantenimiento ascensores")).toBeInTheDocument();
    expect(screen.getByText("Limpieza de tanques")).toBeInTheDocument();
    expect(screen.getByText("21%")).toBeInTheDocument();
    expect(screen.getByText("10,5%")).toBeInTheDocument();
  });

  it("[@display] shows IVA breakdown grouped by rate", () => {
    render(
      <MemoryRouter>
        <InvoiceDetail invoice={makeInvoice()} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Neto Gravado 21%")).toBeInTheDocument();
    expect(screen.getByText("IVA 21%")).toBeInTheDocument();
    expect(screen.getByText("Neto Gravado 10,5%")).toBeInTheDocument();
    expect(screen.getByText("IVA 10,5%")).toBeInTheDocument();
    expect(screen.getByText("$ 9.450,00")).toBeInTheDocument();
  });

  it("[@display] hides zero-amount breakdown rows", () => {
    render(
      <MemoryRouter>
        <InvoiceDetail invoice={makeInvoice()} />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Neto Gravado 27%")).not.toBeInTheDocument();
    expect(screen.queryByText("Exento")).not.toBeInTheDocument();
  });

  it("[@display] Factura B shows IVA contenido instead of breakdown", () => {
    const invoice = makeInvoice({
      tipo_comprobante: "006",
      iva_contenido: { amount: "2100.00", currency: "ARS" },
    });

    render(
      <MemoryRouter>
        <InvoiceDetail invoice={invoice} />
      </MemoryRouter>,
    );

    expect(screen.getByText("IVA Contenido (RG 5614/2024)")).toBeInTheDocument();
    expect(screen.queryByText("Neto Gravado 21%")).not.toBeInTheDocument();
  });

  it("[@display] Anulada invoice renders with line-through header", () => {
    render(
      <MemoryRouter>
        <InvoiceDetail invoice={makeInvoice({ status: "Anulada" })} />
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { name: "0001-00000001" });
    expect(heading.classList.contains("line-through")).toBe(true);
    expect(screen.getByText("Anulada")).toBeInTheDocument();
  });

  it("[@display] shows receptor data and Consumidor Final fallback", () => {
    render(
      <MemoryRouter>
        <InvoiceDetail
          invoice={makeInvoice({ receptor_razon_social: null, receptor_cuit: null })}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Consumidor Final")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("[@display] renders children content (actions area)", () => {
    render(
      <MemoryRouter>
        <InvoiceDetail invoice={makeInvoice()}>
          <a href="/invoices/550e8400-e29b-41d4-a716-446655440801/nc/new">Crear Nota de Crédito</a>
        </InvoiceDetail>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Crear Nota de Crédito" })).toBeInTheDocument();
  });
});
