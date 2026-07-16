import type { Invoice } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { InvoiceList } from "../InvoiceList";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "550e8400-e29b-41d4-a716-446655440801",
    consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
    tipo_comprobante: "001",
    punto_venta: 1,
    numero_comprobante: 1,
    cae: "12345678901234",
    cae_vencimiento: "2026-07-05",
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
    items: [],
    neto_gravado_21: { amount: "45000.00", currency: "ARS" },
    iva_21: { amount: "9450.00", currency: "ARS" },
    neto_gravado_105: { amount: "0.00", currency: "ARS" },
    iva_105: { amount: "0.00", currency: "ARS" },
    neto_gravado_27: { amount: "0.00", currency: "ARS" },
    iva_27: { amount: "0.00", currency: "ARS" },
    neto_exento: { amount: "0.00", currency: "ARS" },
    neto_no_gravado: { amount: "0.00", currency: "ARS" },
    otros_impuestos: [],
    importe_total: { amount: "54450.00", currency: "ARS" },
    iva_contenido: { amount: "9450.00", currency: "ARS" },
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

const mockInvoices: Invoice[] = [
  makeInvoice(),
  makeInvoice({
    id: "550e8400-e29b-41d4-a716-446655440802",
    tipo_comprobante: "006",
    numero_comprobante: 2,
    cae: "23456789012345",
    receptor_cuit: null,
    receptor_razon_social: null,
    receptor_condicion_iva: "CF",
    importe_total: { amount: "3000.00", currency: "ARS" },
  }),
  makeInvoice({
    id: "550e8400-e29b-41d4-a716-446655440803",
    tipo_comprobante: "011",
    numero_comprobante: 3,
    cae: "34567890123456",
    importe_total: { amount: "15000.00", currency: "ARS" },
  }),
];

describe("InvoiceList", () => {
  it("[@display] renders invoice data in table with type badges", () => {
    render(
      <MemoryRouter>
        <InvoiceList invoices={mockInvoices} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Factura A")).toBeInTheDocument();
    expect(screen.getByText("Factura B")).toBeInTheDocument();
    expect(screen.getByText("Factura C")).toBeInTheDocument();
    expect(screen.getByText("$ 54.450,00")).toBeInTheDocument();
    expect(screen.getByText("$ 3.000,00")).toBeInTheDocument();
    expect(screen.getByText("$ 15.000,00")).toBeInTheDocument();
  });

  it("[@display] shows formatted comprobante numbers", () => {
    render(
      <MemoryRouter>
        <InvoiceList invoices={mockInvoices} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("0001-00000001")).toBeInTheDocument();
    expect(screen.getByText("0001-00000002")).toBeInTheDocument();
    expect(screen.getByText("0001-00000003")).toBeInTheDocument();
  });

  it("[@display] shows CAE and receptor columns", () => {
    render(
      <MemoryRouter>
        <InvoiceList invoices={mockInvoices} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("12345678901234")).toBeInTheDocument();
    expect(screen.getAllByText("Consorcio Torre Norte").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Consumidor Final")).toBeInTheDocument();
  });

  it("[@display] shows Anulada invoices with line-through", () => {
    const anulada = [makeInvoice({ status: "Anulada" })];

    render(
      <MemoryRouter>
        <InvoiceList invoices={anulada} isLoading={false} />
      </MemoryRouter>,
    );

    const link = screen.getByText("0001-00000001");
    expect(link.classList.contains("line-through")).toBe(true);
    expect(screen.getByText("Anulada")).toBeInTheDocument();
  });

  it("[@display] links to detail page via Link component", () => {
    render(
      <MemoryRouter>
        <InvoiceList invoices={mockInvoices} isLoading={false} />
      </MemoryRouter>,
    );

    const detailLink = screen.getByRole("link", { name: "0001-00000001" });
    expect(detailLink).toHaveAttribute("href", "/invoices/550e8400-e29b-41d4-a716-446655440801");
  });

  it("[@display] shows Ver links for each invoice", () => {
    render(
      <MemoryRouter>
        <InvoiceList invoices={mockInvoices} isLoading={false} />
      </MemoryRouter>,
    );

    const verLinks = screen.getAllByText("Ver");
    expect(verLinks).toHaveLength(3);
  });

  it("[@empty-state] shows empty message when data is []", () => {
    render(
      <MemoryRouter>
        <InvoiceList invoices={[]} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("No hay facturas emitidas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /emitir la primera/i })).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading", () => {
    render(
      <MemoryRouter>
        <InvoiceList invoices={[]} isLoading />
      </MemoryRouter>,
    );

    expect(screen.queryByText("No hay facturas emitidas")).not.toBeInTheDocument();
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows error with retry button when error prop present", () => {
    render(
      <MemoryRouter>
        <InvoiceList invoices={[]} isLoading={false} error={new Error("Network error")} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Error al cargar las facturas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
