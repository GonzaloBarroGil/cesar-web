import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/debt/debt", () => ({
  useGetLiquidacion: vi.fn(),
  useIssueLiquidacion: vi.fn(),
  useDownloadLiquidacionPdf: vi.fn(),
  getGetLiquidacionQueryKey: vi.fn(),
}));

import {
  useDownloadLiquidacionPdf,
  useGetLiquidacion,
  useIssueLiquidacion,
} from "@/api/generated/debt/debt";
import { LiquidacionDetailPage } from "../LiquidacionDetailPage";

const liquidacionId = "550e8400-e29b-41d4-a716-446655440701";

const mockMoney = { amount: "0.00", currency: "ARS" as const };
const mockMoney45000 = { amount: "45000.00", currency: "ARS" as const };
const mockMoney40000 = { amount: "40000.00", currency: "ARS" as const };
const mockMoney5000 = { amount: "5000.00", currency: "ARS" as const };

const mockLiquidacion = {
  id: liquidacionId,
  consorcio_id: "cons-1",
  period_code: { code: "202606" },
  unit_id: "unit-1",
  previous_balance: mockMoney,
  expenses_breakdown: [],
  total_unit_expenses: mockMoney40000,
  compensatory_interest: mockMoney5000,
  punitive_interest: mockMoney,
  round_off: mockMoney,
  total_debt: mockMoney45000,
  payments_applied: mockMoney,
  current_balance: mockMoney45000,
  liquidacion_number: "LC-202606-001",
  qr_code: "qr-test-data",
  status: "DRAFT" as const,
  hash: "a".repeat(64),
  version: 1,
  generated_at: "2026-06-15T10:00:00Z",
  issued_at: null,
  created_at: "2026-06-15T10:00:00Z",
  tombstone: false,
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/debt/${liquidacionId}`]}>
        <Routes>
          <Route path="/debt/:id" element={<LiquidacionDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("LiquidacionDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useIssueLiquidacion).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useIssueLiquidacion>>);
    vi.mocked(useDownloadLiquidacionPdf).mockReturnValue({
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useDownloadLiquidacionPdf>>);
  });

  it("[@display] renders liquidacion detail with tabs", () => {
    vi.mocked(useGetLiquidacion).mockReturnValue({
      data: { liquidacion: mockLiquidacion },
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetLiquidacion>>);
    renderPage();

    expect(screen.getByText("Deuda")).toBeInTheDocument();
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Asignaciones")).toBeInTheDocument();
  });

  it("[@display] renders hash and QR code on general tab", () => {
    vi.mocked(useGetLiquidacion).mockReturnValue({
      data: { liquidacion: mockLiquidacion },
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetLiquidacion>>);
    renderPage();

    expect(screen.getByText("qr-test-data")).toBeInTheDocument();
    expect(screen.getByText("Codigo QR (DI-1146/24)")).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useGetLiquidacion).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as Partial<ReturnType<typeof useGetLiquidacion>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders not found message when error", () => {
    vi.mocked(useGetLiquidacion).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as Partial<ReturnType<typeof useGetLiquidacion>>);
    renderPage();

    expect(screen.getByText("Liquidacion no encontrada")).toBeInTheDocument();
    expect(screen.getByText("Volver a Deuda")).toBeInTheDocument();
  });
});
