import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/debt/debt", () => ({
  useListLiquidaciones: vi.fn(),
  useGenerateLiquidacion: vi.fn(),
  useGenerateLiquidacionBatch: vi.fn(),
  getListLiquidacionesQueryKey: vi.fn(() => ["liquidaciones"]),
}));

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: vi.fn(() => ({ user: { nombre_completo: "Administrador Test" } })),
}));

import {
  useGenerateLiquidacion,
  useGenerateLiquidacionBatch,
  useListLiquidaciones,
} from "@/api/generated/debt/debt";
import { MockConsorcioProvider } from "@/features/layout/__tests__/mocks";
import { DebtPage } from "../DebtPage";

const TEST_CONSORCIO_ID = "cons-1";

const mockConsorcios = [
  { id: TEST_CONSORCIO_ID, cuit: "30711111111", razon_social: "Consorcio Test" },
];

const mockMoney = { amount: "0.00", currency: "ARS" as const };
const mockMoney45000 = { amount: "45000.00", currency: "ARS" as const };

const mockLiquidacion = {
  id: "liq-1",
  consorcio_id: "cons-1",
  period_code: { code: "202606" },
  unit_id: "unit-1",
  previous_balance: mockMoney,
  expenses_breakdown: [],
  total_unit_expenses: mockMoney45000,
  compensatory_interest: mockMoney,
  punitive_interest: mockMoney,
  round_off: mockMoney,
  total_debt: mockMoney45000,
  payments_applied: mockMoney,
  current_balance: mockMoney45000,
  liquidacion_number: "LC-202606-001",
  qr_code: "https://example.com/qr",
  status: "DRAFT",
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
      <MockConsorcioProvider selectedId={TEST_CONSORCIO_ID} consorcios={mockConsorcios}>
        <MemoryRouter>
          <DebtPage />
        </MemoryRouter>
      </MockConsorcioProvider>
    </QueryClientProvider>,
  );
}

describe("DebtPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGenerateLiquidacion).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({ liquidacion: { id: "liq-1" } }),
      isPending: false,
    } as Partial<ReturnType<typeof useGenerateLiquidacion>>);
    vi.mocked(useGenerateLiquidacionBatch).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    } as Partial<ReturnType<typeof useGenerateLiquidacionBatch>>);
  });

  it("[@display] renders page title and navigation links", () => {
    vi.mocked(useListLiquidaciones).mockReturnValue({
      data: { liquidaciones: [], count: 0 },
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListLiquidaciones>>);
    renderPage();

    expect(screen.getByText("Deuda")).toBeInTheDocument();
    expect(screen.getByText("Certificados")).toBeInTheDocument();
    expect(screen.getByText("Generar Liquidacion")).toBeInTheDocument();
  });

  it("[@display] renders filters", () => {
    vi.mocked(useListLiquidaciones).mockReturnValue({
      data: { liquidaciones: [], count: 0 },
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListLiquidaciones>>);
    renderPage();

    expect(screen.getByPlaceholderText("Periodo (YYYYMM)")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar por estado")).toBeInTheDocument();
  });

  it("[@display] renders LiquidacionList with data", () => {
    vi.mocked(useListLiquidaciones).mockReturnValue({
      data: {
        liquidaciones: [mockLiquidacion],
        count: 1,
      },
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListLiquidaciones>>);
    renderPage();

    expect(screen.getByText("202606")).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useListLiquidaciones).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as Partial<ReturnType<typeof useListLiquidaciones>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders error message", () => {
    vi.mocked(useListLiquidaciones).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("test error"),
    } as Partial<ReturnType<typeof useListLiquidaciones>>);
    renderPage();

    expect(screen.getByText("Error al cargar las liquidaciones")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
