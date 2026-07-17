import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/invoices/invoices", () => ({
  useGetRecibo: vi.fn(),
  useAnularRecibo: vi.fn(),
  getGetReciboQueryKey: vi.fn(),
}));

import { useAnularRecibo, useGetRecibo } from "@/api/generated/invoices/invoices";
import { ReciboDetailPage } from "../ReciboDetailPage";

const reciboId = "550e8400-e29b-41d4-a716-446655440701";
const adminUser = {
  id: "1",
  username: "admin",
  role: "ADMIN" as const,
  consorcio_id: null,
  nombre_completo: "Administrador General",
};

const mockRecibo = {
  id: reciboId,
  consorcio_id: "cons-1",
  tipo_comprobante: "015" as const,
  punto_venta: 1,
  numero_comprobante: 1,
  fecha_emision: "2026-06-15T10:00:00Z",
  fecha_pago: "2026-06-15T10:00:00Z",
  importe_pagado: { amount: "45000.00", currency: "ARS" as const },
  medio_pago: "EFECTIVO",
  factura_asociada_id: "inv-1",
  liquidacion_ref: null,
  status: "Activo" as const,
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
        <MemoryRouter initialEntries={[`/invoices/recibos/${reciboId}`]}>
          <Routes>
            <Route path="/invoices/recibos/:id" element={<ReciboDetailPage />} />
          </Routes>
        </MemoryRouter>
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("ReciboDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAnularRecibo).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useAnularRecibo>>);
  });

  it("[@display] renders recibo detail with data", () => {
    vi.mocked(useGetRecibo).mockReturnValue({
      data: { data: mockRecibo },
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetRecibo>>);
    renderPage();

    expect(screen.getByText("Facturación")).toBeInTheDocument();
    expect(screen.getByText("EFECTIVO")).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useGetRecibo).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as Partial<ReturnType<typeof useGetRecibo>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders not found message when error", () => {
    vi.mocked(useGetRecibo).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as Partial<ReturnType<typeof useGetRecibo>>);
    renderPage();

    expect(screen.getByText("Recibo no encontrado")).toBeInTheDocument();
    expect(screen.getByText("Volver a Facturación")).toBeInTheDocument();
  });
});
