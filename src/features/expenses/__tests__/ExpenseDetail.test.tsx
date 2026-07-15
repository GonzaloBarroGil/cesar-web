import type { ExpenseResponse } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExpenseDetail } from "../ExpenseDetail";

const mockExpense: ExpenseResponse = {
  id: "550e8400-e29b-41d4-a716-446655440701",
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
  version: 3,
  created_at: "2026-06-15T10:00:00Z",
  created_by: "550e8400-e29b-41d4-a716-446655440999",
  tombstone: false,
};

describe("ExpenseDetail", () => {
  it("[@display] renders expense item as heading", () => {
    render(<ExpenseDetail expense={mockExpense} />);

    expect(screen.getByRole("heading", { name: "Luz enero" })).toBeInTheDocument();
  });

  it("[@display] shows approval status badge (APPROVED)", () => {
    render(<ExpenseDetail expense={mockExpense} />);

    expect(screen.getByText("Aprobado")).toBeInTheDocument();
  });

  it("[@display] shows approval status badge (PENDING)", () => {
    const pending = { ...mockExpense, approval_status: "PENDING" as const };
    render(<ExpenseDetail expense={pending} />);

    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("[@display] shows expense type badge", () => {
    render(<ExpenseDetail expense={mockExpense} />);

    expect(screen.getByText("Ordinaria")).toBeInTheDocument();
  });

  it("[@display] shows EXTRAORDINARIA type badge", () => {
    const extra = { ...mockExpense, expense_type: "EXTRAORDINARIA" as const };
    render(<ExpenseDetail expense={extra} />);

    expect(screen.getByText("Extraordinaria")).toBeInTheDocument();
  });

  it("[@display] shows cost with MoneyDisplay", () => {
    render(<ExpenseDetail expense={mockExpense} />);

    expect(screen.getByText("$ 45.000,00")).toBeInTheDocument();
  });

  it("[@display] shows period code", () => {
    render(<ExpenseDetail expense={mockExpense} />);

    expect(screen.getByText("202606")).toBeInTheDocument();
  });

  it("[@display] shows version number", () => {
    render(<ExpenseDetail expense={mockExpense} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("[@display] shows term info", () => {
    render(<ExpenseDetail expense={mockExpense} />);

    expect(screen.getByText("1 de 1")).toBeInTheDocument();
  });

  it("[@display] shows created date", () => {
    render(<ExpenseDetail expense={mockExpense} />);

    expect(screen.getByText("15/6/2026")).toBeInTheDocument();
  });

  it("[@display] shows tombstone badge when anulado", () => {
    const anulado = { ...mockExpense, tombstone: true };
    render(<ExpenseDetail expense={anulado} />);

    expect(screen.getByText("Anulado")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <ExpenseDetail expense={mockExpense}>
        <p>Contenido extra</p>
      </ExpenseDetail>,
    );

    expect(screen.getByText("Contenido extra")).toBeInTheDocument();
  });

  it("handles high cost values correctly", () => {
    const highCost = {
      ...mockExpense,
      cost: { amount: "1500000.00", currency: "ARS" },
    };
    render(<ExpenseDetail expense={highCost} />);

    expect(screen.getByText("$ 1.500.000,00")).toBeInTheDocument();
  });
});
