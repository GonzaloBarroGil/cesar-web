import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/incomes-outputs/incomes-outputs", () => ({
  useGetFinancialSummary: vi.fn(),
  useGetCrossPeriodSummary: vi.fn(),
}));

vi.mock("@/features/layout/ConsorcioContext", () => ({
  useConsorcio: vi.fn(() => ({
    selectedId: "550e8400-e29b-41d4-a716-446655440001",
    consorcios: [],
    isLoading: false,
    select: vi.fn(),
  })),
}));

import {
  useGetCrossPeriodSummary,
  useGetFinancialSummary,
} from "@/api/generated/incomes-outputs/incomes-outputs";
import type { FinancialSummary } from "@/api/generated/models";
import { SummaryPage } from "../SummaryPage";

const singleSummary: FinancialSummary = {
  total_income: { amount: "120000.00", currency: "ARS" },
  total_output: { amount: "85000.00", currency: "ARS" },
  net_flow: { amount: "35000.00", currency: "ARS" },
};

const crossSummary: Record<string, FinancialSummary> = {
  "202605": {
    total_income: { amount: "100000.00", currency: "ARS" },
    total_output: { amount: "60000.00", currency: "ARS" },
    net_flow: { amount: "40000.00", currency: "ARS" },
    opening_balance: { amount: "0.00", currency: "ARS" },
    closing_balance: { amount: "40000.00", currency: "ARS" },
  },
  "202606": {
    total_income: { amount: "120000.00", currency: "ARS" },
    total_output: { amount: "85000.00", currency: "ARS" },
    net_flow: { amount: "35000.00", currency: "ARS" },
    opening_balance: { amount: "40000.00", currency: "ARS" },
    closing_balance: { amount: "75000.00", currency: "ARS" },
  },
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/incomes-outputs/summary"]}>
        <SummaryPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("SummaryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetFinancialSummary).mockReturnValue({
      data: singleSummary,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetFinancialSummary>>);
    vi.mocked(useGetCrossPeriodSummary).mockReturnValue({
      data: crossSummary,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetCrossPeriodSummary>>);
  });

  it("[@display] renders title, tabs and period selector", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Resumen Financiero" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Por Período" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Acumulado" })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("[@display] renders single-period summary card", () => {
    renderPage();

    expect(screen.getByText("Ingresos")).toBeInTheDocument();
    expect(screen.getByText("Egresos")).toBeInTheDocument();
    expect(screen.getByText("Resultado neto")).toBeInTheDocument();
    expect(screen.getByText(/120\.000,00/)).toBeInTheDocument();
    expect(screen.getByText(/85\.000,00/)).toBeInTheDocument();
    expect(screen.getByText(/35\.000,00/)).toBeInTheDocument();
  });

  it("[@display] changing the period refetches via hook params", () => {
    renderPage();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "202605" } });

    expect(useGetFinancialSummary).toHaveBeenLastCalledWith(
      { code: "202605" },
      { consorcio_id: "550e8400-e29b-41d4-a716-446655440001" },
      expect.anything(),
    );
  });

  it("[@loading] renders loading skeleton for single-period summary", () => {
    vi.mocked(useGetFinancialSummary).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetFinancialSummary>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders error state with retry button", () => {
    vi.mocked(useGetFinancialSummary).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { error: { code: "INTERNAL", message: "boom" } },
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetFinancialSummary>>);
    renderPage();

    expect(screen.getByText("Error al cargar el resumen")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("[@happy-path] Acumulado tab renders cascade with balances", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Acumulado" }));

    expect(screen.getByText("Saldo inicial")).toBeInTheDocument();
    expect(screen.getByText("+ Ingresos")).toBeInTheDocument();
    expect(screen.getByText("− Egresos")).toBeInTheDocument();
    expect(screen.getByText("Flujo neto")).toBeInTheDocument();
    expect(screen.getAllByText("Saldo final").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/220\.000,00/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/75\.000,00/).length).toBeGreaterThan(0);
  });

  it("[@happy-path] Acumulado tab renders per-period breakdown table", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Acumulado" }));

    expect(screen.getByText("Período")).toBeInTheDocument();
    expect(screen.getByText("202605")).toBeInTheDocument();
    expect(screen.getByText("202606")).toBeInTheDocument();
  });

  it("[@empty-state] Acumulado tab renders empty state when no periods", () => {
    vi.mocked(useGetCrossPeriodSummary).mockReturnValue({
      data: {},
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetCrossPeriodSummary>>);
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Acumulado" }));

    expect(screen.getByText("Sin datos acumulados.")).toBeInTheDocument();
  });

  it("[@display] Acumulado tab renders period range inputs", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Acumulado" }));

    expect(screen.getByLabelText("Periodo desde")).toBeInTheDocument();
    expect(screen.getByLabelText("Periodo hasta")).toBeInTheDocument();
  });
});
