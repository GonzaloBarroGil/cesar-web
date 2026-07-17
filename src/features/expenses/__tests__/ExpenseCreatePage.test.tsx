import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/expenses/expenses", () => ({
  useCreateExpense: vi.fn(),
}));

import { useCreateExpense } from "@/api/generated/expenses/expenses";
import { ExpenseCreatePage } from "../ExpenseCreatePage";

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ExpenseCreatePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ExpenseCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("[@display] renders back link", () => {
    vi.mocked(useCreateExpense).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useCreateExpense>>);
    renderPage();

    expect(screen.getByText("Expensas")).toBeInTheDocument();
  });

  it("[@display] renders ExpenseForm", () => {
    vi.mocked(useCreateExpense).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useCreateExpense>>);
    renderPage();

    expect(screen.getByText("Nuevo Gasto")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripcion")).toBeInTheDocument();
    expect(screen.getByLabelText("Costo (ARS)")).toBeInTheDocument();
    expect(screen.getByLabelText(/Periodo/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear gasto/i })).toBeInTheDocument();
  });

  it("[@display] disables submit button when submitting", () => {
    vi.mocked(useCreateExpense).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as Partial<ReturnType<typeof useCreateExpense>>);
    renderPage();

    const submitButton = screen.getByRole("button", { name: /guardando/i });
    expect(submitButton).toBeDisabled();
  });
});
