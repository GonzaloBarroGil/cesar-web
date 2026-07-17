import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/invoices/invoices", () => ({
  useGetInvoice: vi.fn(),
  useAnularInvoice: vi.fn(),
  getGetInvoiceQueryKey: vi.fn(),
}));

import { useAnularInvoice, useGetInvoice } from "@/api/generated/invoices/invoices";
import { InvoiceDetailPage } from "../InvoiceDetailPage";

const invoiceId = "550e8400-e29b-41d4-a716-446655440701";
const adminUser = {
  id: "1",
  username: "admin",
  role: "ADMIN" as const,
  consorcio_id: null,
  nombre_completo: "Administrador General",
};
const zeroMoney = { amount: "0.00", currency: "ARS" as const };
const money45000 = { amount: "45000.00", currency: "ARS" as const };
const money40000 = { amount: "40000.00", currency: "ARS" as const };
const money5000 = { amount: "5000.00", currency: "ARS" as const };

const mockInvoice = {
  id: invoiceId,
  consorcio_id: "cons-1",
  tipo_comprobante: "001" as const,
  punto_venta: 1,
  numero_comprobante: 1,
  cae: "12345678901234",
  cae_vencimiento: "2026-12-31",
  fecha_emision: "2026-06-15T10:00:00Z",
  fecha_vencimiento: null,
  emisor_cuit: "30123456789",
  emisor_razon_social: "Consorcio Test",
  emisor_domicilio: "Av. Siempre Viva 742",
  emisor_condicion_iva: "RI" as const,
  emisor_iibb: null,
  receptor_cuit: "30999999999",
  receptor_razon_social: "Comprador Test",
  receptor_domicilio: "Calle Falsa 123",
  receptor_condicion_iva: "RI" as const,
  concepto: "Productos",
  importe_total: money45000,
  neto_gravado_21: money40000,
  iva_21: money5000,
  neto_gravado_105: zeroMoney,
  iva_105: zeroMoney,
  neto_gravado_27: zeroMoney,
  iva_27: zeroMoney,
  neto_exento: zeroMoney,
  neto_no_gravado: zeroMoney,
  iva_contenido: zeroMoney,
  items: [],
  impuestos: [],
  adicionales: null,
  status: "Activa" as const,
  hash: "a".repeat(64),
  version: 1,
  created_at: "2026-06-15T10:00:00Z",
  tombstone: false,
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter initialEntries={[`/invoices/${invoiceId}`]}>
          <Routes>
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          </Routes>
        </MemoryRouter>
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("InvoiceDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAnularInvoice).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useAnularInvoice>>);
  });

  it("[@display] renders invoice detail with data", () => {
    vi.mocked(useGetInvoice).mockReturnValue({
      data: { data: mockInvoice },
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetInvoice>>);
    renderPage();

    expect(screen.getByText("Facturación")).toBeInTheDocument();
    expect(screen.getByText("Comprador Test")).toBeInTheDocument();
  });

  it("[@display] renders action buttons for active invoice", () => {
    vi.mocked(useGetInvoice).mockReturnValue({
      data: { data: mockInvoice },
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetInvoice>>);
    renderPage();

    expect(screen.getByText("Crear Nota de Crédito")).toBeInTheDocument();
    expect(screen.getByText("Crear Nota de Débito")).toBeInTheDocument();
    expect(screen.getByText("Crear Recibo")).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useGetInvoice).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as Partial<ReturnType<typeof useGetInvoice>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders not found message when error", () => {
    vi.mocked(useGetInvoice).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as Partial<ReturnType<typeof useGetInvoice>>);
    renderPage();

    expect(screen.getByText("Factura no encontrada")).toBeInTheDocument();
    expect(screen.getByText("Volver a Facturación")).toBeInTheDocument();
  });
});
