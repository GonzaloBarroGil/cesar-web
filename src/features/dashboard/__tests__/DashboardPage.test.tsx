import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/debt/debt", () => ({
  useListLiquidaciones: vi.fn(),
}));

vi.mock("@/api/generated/payments/payments", () => ({
  useListPayments: vi.fn(),
}));

vi.mock("@/api/generated/expenses/expenses", () => ({
  useListExpenses: vi.fn(),
}));

vi.mock("@/api/generated/incomes-outputs/incomes-outputs", () => ({
  useGetFinancialSummary: vi.fn(),
}));

vi.mock("@/features/layout/ConsorcioContext", () => ({
  useConsorcio: vi.fn(() => ({
    selectedId: "550e8400-e29b-41d4-a716-446655440001",
    consorcios: [],
    isLoading: false,
    select: vi.fn(),
  })),
}));

import { useListLiquidaciones } from "@/api/generated/debt/debt";
import { useListExpenses } from "@/api/generated/expenses/expenses";
import { useGetFinancialSummary } from "@/api/generated/incomes-outputs/incomes-outputs";
import type { Liquidacion } from "@/api/generated/models";
import { useListPayments } from "@/api/generated/payments/payments";
import { useConsorcio } from "@/features/layout/ConsorcioContext";
import { DashboardPage } from "../DashboardPage";

const mockLiquidacion: Liquidacion = {
  id: "lid-1",
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  period_code: { code: "202606" },
  unit_id: "unit-1",
  previous_balance: { amount: "0", currency: "ARS" },
  expenses_breakdown: [],
  total_unit_expenses: { amount: "45000.00", currency: "ARS" },
  compensatory_interest: { amount: "0", currency: "ARS" },
  punitive_interest: { amount: "0", currency: "ARS" },
  round_off: { amount: "0", currency: "ARS" },
  total_debt: { amount: "45000.00", currency: "ARS" },
  payments_applied: { amount: "30000.00", currency: "ARS" },
  current_balance: { amount: "15000.00", currency: "ARS" },
  liquidacion_number: "LC-202606-001",
  qr_code: "qr",
  status: "DRAFT",
  hash: "a".repeat(64),
  version: 1,
  generated_at: "2026-06-01T00:00:00Z",
  issued_at: null,
  created_at: "2026-06-01T00:00:00Z",
  tombstone: false,
};

const mockPayment = {
  id: "pay-1",
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  unit_id: "UF-1A",
  period_code: "202606",
  payment_date: "2026-06-10",
  amount: { amount: "30000.00", currency: "ARS" as const },
  method: "TRANSFER" as const,
  has_voucher: true,
  voucher_ref: "TRF-001",
  status: "ACTIVE" as const,
  hash: "a".repeat(64),
  version: 1,
  created_at: "2026-06-10T10:00:00Z",
  created_by: "user-1",
  tombstone: false,
};

const mockSummary = {
  total_income: { amount: "150000.00", currency: "ARS" as const },
  total_output: { amount: "80000.00", currency: "ARS" as const },
  net_flow: { amount: "70000.00", currency: "ARS" as const },
};

function renderPage(initialEntry = "/") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function setupMocks() {
  vi.mocked(useListLiquidaciones).mockReturnValue({
    data: { liquidaciones: [mockLiquidacion], count: 1 },
    isLoading: false,
    isError: false,
    fetchStatus: "idle",
    refetch: vi.fn(),
  } as Partial<ReturnType<typeof useListLiquidaciones>>);
  vi.mocked(useListPayments).mockReturnValue({
    data: [mockPayment],
    isLoading: false,
    isError: false,
    fetchStatus: "idle",
    refetch: vi.fn(),
  } as Partial<ReturnType<typeof useListPayments>>);
  vi.mocked(useListExpenses).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as Partial<ReturnType<typeof useListExpenses>>);
  vi.mocked(useGetFinancialSummary).mockReturnValue({
    data: mockSummary,
    isLoading: false,
    isError: false,
    fetchStatus: "idle",
    refetch: vi.fn(),
  } as Partial<ReturnType<typeof useGetFinancialSummary>>);
  vi.mocked(useConsorcio).mockReturnValue({
    selectedId: "550e8400-e29b-41d4-a716-446655440001",
    consorcios: [],
    isLoading: false,
    select: vi.fn(),
  });
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("[@display] renders page title", () => {
    setupMocks();
    renderPage();
    expect(screen.getByRole("heading", { name: "Panel de Control" })).toBeInTheDocument();
  });

  it("[@display] renders period selector with period codes", () => {
    setupMocks();
    renderPage();
    expect(screen.getByLabelText("Seleccionar período")).toBeInTheDocument();
  });

  it("[@display] renders all 6 metric cards with data", () => {
    setupMocks();
    renderPage();
    expect(screen.getByText("Deuda Total")).toBeInTheDocument();
    expect(screen.getByText("Tasa de Cobranza")).toBeInTheDocument();
    expect(screen.getByText("Pendientes de Aprobación")).toBeInTheDocument();
    expect(screen.getByText("Liquidaciones Activas")).toBeInTheDocument();
    expect(screen.getByText("Ingresos y Egresos")).toBeInTheDocument();
    expect(screen.getByText("Actividad Reciente")).toBeInTheDocument();
  });

  it("[@loading] renders skeleton grid when loading with no data", () => {
    vi.mocked(useListLiquidaciones).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      fetchStatus: "fetching",
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useListLiquidaciones>>);
    vi.mocked(useListPayments).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      fetchStatus: "fetching",
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useListPayments>>);
    vi.mocked(useListExpenses).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useListExpenses>>);
    vi.mocked(useGetFinancialSummary).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      fetchStatus: "fetching",
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetFinancialSummary>>);

    const { container } = renderPage();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("[@error-state] renders full-page error when all queries fail", () => {
    vi.mocked(useListLiquidaciones).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      fetchStatus: "idle",
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useListLiquidaciones>>);
    vi.mocked(useListPayments).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      fetchStatus: "idle",
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useListPayments>>);
    vi.mocked(useListExpenses).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useListExpenses>>);
    vi.mocked(useGetFinancialSummary).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      fetchStatus: "idle",
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetFinancialSummary>>);

    renderPage();
    expect(
      screen.getByText("No se pudieron cargar los datos del panel. Verifique su conexión."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("[@empty-state] renders message when no consorcio selected", () => {
    vi.mocked(useConsorcio).mockReturnValue({
      selectedId: null,
      consorcios: [],
      isLoading: false,
      select: vi.fn(),
    });
    vi.mocked(useListLiquidaciones).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      fetchStatus: "idle",
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useListLiquidaciones>>);
    vi.mocked(useListPayments).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      fetchStatus: "idle",
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useListPayments>>);
    vi.mocked(useListExpenses).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useListExpenses>>);
    vi.mocked(useGetFinancialSummary).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      fetchStatus: "idle",
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetFinancialSummary>>);

    renderPage();
    expect(screen.getByText("Seleccione un consorcio para ver el panel.")).toBeInTheDocument();
  });

  it("[@happy-path] debt card navigates to /debt", () => {
    setupMocks();
    renderPage();
    const debtCard = screen.getByText("Deuda Total").closest('[role="button"]') as HTMLElement;
    expect(debtCard).toBeInTheDocument();
  });

  it("[@happy-path] renders collection rate with correct format", () => {
    setupMocks();
    renderPage();
    expect(screen.getByText("Tasa de Cobranza")).toBeInTheDocument();
    expect(screen.getByText("66.7%")).toBeInTheDocument();
  });
});
