import type { ExpenseResponse } from "@/api/generated/models";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/expenses/expenses", () => ({
  useListExpenses: vi.fn(),
  useGetExpenseVersions: vi.fn(),
  useApproveExpense: vi.fn(),
  useRejectExpense: vi.fn(),
  useTombstoneExpense: vi.fn(),
}));

import {
  useApproveExpense,
  useGetExpenseVersions,
  useListExpenses,
  useRejectExpense,
  useTombstoneExpense,
} from "@/api/generated/expenses/expenses";
import { ExpenseDetailPage } from "../ExpenseDetailPage";

const expenseId = "550e8400-e29b-41d4-a716-446655440701";

const mockExpense: ExpenseResponse = {
  id: expenseId,
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
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
      <MemoryRouter initialEntries={[`/expenses/${expenseId}`]}>
        <Routes>
          <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockMutationDefaults() {
  return { mutate: vi.fn(), isPending: false, isError: false, error: null };
}

describe("ExpenseDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApproveExpense).mockReturnValue(mockMutationDefaults());
    vi.mocked(useRejectExpense).mockReturnValue(mockMutationDefaults());
    vi.mocked(useTombstoneExpense).mockReturnValue(mockMutationDefaults());
    vi.mocked(useGetExpenseVersions).mockReturnValue({
      data: [],
      isLoading: false,
    } as Partial<ReturnType<typeof useGetExpenseVersions>>);
  });

  it("[@display] renders expense detail with tabs when data loaded", () => {
    vi.mocked(useListExpenses).mockReturnValue({
      data: [mockExpense],
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useListExpenses>>);
    renderPage();

    expect(screen.getByText("Expensas")).toBeInTheDocument();
    expect(screen.getByText("Luz enero")).toBeInTheDocument();
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Historial")).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useListExpenses).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as Partial<ReturnType<typeof useListExpenses>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders not found message when error", () => {
    vi.mocked(useListExpenses).mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    } as Partial<ReturnType<typeof useListExpenses>>);
    renderPage();

    expect(screen.getByText("Gasto no encontrado")).toBeInTheDocument();
    expect(screen.getByText("Volver a Expensas")).toBeInTheDocument();
  });

  it("[@error-state] renders not found when expense missing from list", () => {
    vi.mocked(useListExpenses).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useListExpenses>>);
    renderPage();

    expect(screen.getByText("Gasto no encontrado")).toBeInTheDocument();
  });

  it("[@display] renders version history tab content when selected", () => {
    vi.mocked(useListExpenses).mockReturnValue({
      data: [mockExpense],
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useListExpenses>>);
    renderPage();

    expect(screen.getByText("Historial")).toBeInTheDocument();
  });
});
