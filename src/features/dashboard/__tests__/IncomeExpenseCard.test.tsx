import type { FinancialSummary } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IncomeExpenseCard } from "../IncomeExpenseCard";

const mockSummary: FinancialSummary = {
  total_income: { amount: "150000.00", currency: "ARS" },
  total_output: { amount: "80000.00", currency: "ARS" },
  net_flow: { amount: "70000.00", currency: "ARS" },
};

describe("IncomeExpenseCard", () => {
  it("[@display] renders income, output, and net flow", () => {
    render(
      <IncomeExpenseCard summary={mockSummary} loading={false} error={false} onRetry={vi.fn()} />,
    );

    expect(screen.getByText("Ingresos y Egresos")).toBeInTheDocument();
    expect(screen.getByText("Ingresos")).toBeInTheDocument();
    expect(screen.getByText("Egresos")).toBeInTheDocument();
    expect(screen.getByText("Neto")).toBeInTheDocument();
  });

  it("[@loading] renders skeleton placeholders", () => {
    const { container } = render(<IncomeExpenseCard loading error={false} onRetry={vi.fn()} />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders error message with retry button", () => {
    const onRetry = vi.fn();
    render(<IncomeExpenseCard loading={false} error onRetry={onRetry} />);

    expect(screen.getByText("No se pudo cargar.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("[@error-state] retry button triggers onRetry", () => {
    const onRetry = vi.fn();
    render(<IncomeExpenseCard loading={false} error onRetry={onRetry} />);

    screen.getByRole("button", { name: "Reintentar" }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("[@empty-state] renders empty message when no summary", () => {
    render(
      <IncomeExpenseCard summary={undefined} loading={false} error={false} onRetry={vi.fn()} />,
    );

    expect(screen.getByText("Sin movimientos en este período.")).toBeInTheDocument();
  });
});
