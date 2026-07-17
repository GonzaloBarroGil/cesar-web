import type { Money } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FinancialSummary } from "../FinancialSummary";

const mockSummary = {
  previous_balance: { amount: "5000.00", currency: "ARS" } as Money,
  total_unit_expenses: { amount: "20000.00", currency: "ARS" } as Money,
  compensatory_interest: { amount: "500.00", currency: "ARS" } as Money,
  punitive_interest: { amount: "0.00", currency: "ARS" } as Money,
  round_off: { amount: "454.55", currency: "ARS" } as Money,
  total_debt: { amount: "25954.55", currency: "ARS" } as Money,
  payments_applied: { amount: "0.00", currency: "ARS" } as Money,
  current_balance: { amount: "25954.55", currency: "ARS" } as Money,
};

describe("FinancialSummary", () => {
  it("[@display] renders the heading", () => {
    render(<FinancialSummary summary={mockSummary} />);

    expect(screen.getByText("Resumen Financiero")).toBeInTheDocument();
  });

  it("[@display] renders all 7 rows plus current_balance highlight", () => {
    render(<FinancialSummary summary={mockSummary} />);

    expect(screen.getByText("Saldo anterior")).toBeInTheDocument();
    expect(screen.getByText("Gastos del periodo")).toBeInTheDocument();
    expect(screen.getByText("Interes compensatorio")).toBeInTheDocument();
    expect(screen.getByText("Interes punitorio")).toBeInTheDocument();
    expect(screen.getByText("Redondeo")).toBeInTheDocument();
    expect(screen.getByText("Deuda total")).toBeInTheDocument();
    expect(screen.getByText("Pagos aplicados")).toBeInTheDocument();
  });

  it("[@display] highlights current_balance", () => {
    render(<FinancialSummary summary={mockSummary} />);

    const saldoActualElements = screen.getAllByText("Saldo actual");
    expect(saldoActualElements.length).toBeGreaterThanOrEqual(1);

    const balanceElements = screen.getAllByText(/25.954,55/);
    expect(balanceElements.length).toBeGreaterThanOrEqual(1);
  });

  it("[@display] uses MoneyDisplay for all amounts", () => {
    render(<FinancialSummary summary={mockSummary} />);

    expect(screen.getByText(/5.000,00/)).toBeInTheDocument();
    expect(screen.getByText(/20.000,00/)).toBeInTheDocument();
    expect(screen.getByText(/500,00/)).toBeInTheDocument();
    const zeroElements = screen.getAllByText(/0,00/);
    expect(zeroElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/454,55/)).toBeInTheDocument();
  });
});
