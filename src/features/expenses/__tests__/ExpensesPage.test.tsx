import type { ExpenseResponse } from "@/api/generated/models";
import { MockConsorcioProvider } from "@/features/layout/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/expenses/expenses", () => ({
  useListExpenses: vi.fn(),
}));

import { useListExpenses } from "@/api/generated/expenses/expenses";
import { ExpensesPage } from "../ExpensesPage";

const TEST_CONSORCIO_ID = "550e8400-e29b-41d4-a716-446655440001";

const mockConsorcios = [
  {
    id: TEST_CONSORCIO_ID,
    cuit: "30711111111",
    razon_social: "Consorcio Test",
  },
];

const mockExpense: ExpenseResponse = {
  id: "550e8400-e29b-41d4-a716-446655440701",
  consorcio_id: TEST_CONSORCIO_ID,
  period_code: "202606",
  category_id: "550e8400-e29b-41d4-a716-446655440100",
  concept_id: "550e8400-e29b-41d4-a716-446655440200",
  item: "Luz enero",
  term: 1,
  total_terms: 1,
  provider_id: "550e8400-e29b-41d4-a716-446655440300",
  cost: { amount: "45000.00", currency: "ARS" },
  expense_type: "ORDINARIA",
  approval_status: "APPROVED",
  hash: "a".repeat(64),
  version: 0,
  created_at: "2026-06-15T10:00:00Z",
  created_by: "550e8400-e29b-41d4-a716-446655440999",
  tombstone: false,
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MockConsorcioProvider selectedId={TEST_CONSORCIO_ID} consorcios={mockConsorcios}>
        <MemoryRouter>
          <ExpensesPage />
        </MemoryRouter>
      </MockConsorcioProvider>
    </QueryClientProvider>,
  );
}

describe("ExpensesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("[@display] renders page title and navigation links", () => {
    vi.mocked(useListExpenses).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListExpenses>>);
    renderPage();

    expect(screen.getByText("Expensas")).toBeInTheDocument();
    expect(screen.getByText("Proveedores")).toBeInTheDocument();
    expect(screen.getByText("Conceptos")).toBeInTheDocument();
    expect(screen.getByText("Categorias")).toBeInTheDocument();
    expect(screen.getByText("Nuevo Gasto")).toBeInTheDocument();
  });

  it("[@display] renders expense list with data", () => {
    vi.mocked(useListExpenses).mockReturnValue({
      data: [mockExpense],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListExpenses>>);
    renderPage();

    expect(screen.getByText("Luz enero")).toBeInTheDocument();
    expect(screen.getByText("$ 45.000,00")).toBeInTheDocument();
  });

  it("[@display] renders filters", () => {
    vi.mocked(useListExpenses).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListExpenses>>);
    renderPage();

    expect(screen.getByLabelText("Periodo")).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
    expect(screen.getByLabelText("Estado")).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton when loading", () => {
    vi.mocked(useListExpenses).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as Partial<ReturnType<typeof useListExpenses>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders error message and retry button", () => {
    vi.mocked(useListExpenses).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Network error"),
    } as Partial<ReturnType<typeof useListExpenses>>);
    renderPage();

    expect(screen.getByText("Error al cargar los gastos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
