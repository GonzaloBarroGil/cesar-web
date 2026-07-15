import type { ExpenseResponse } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ExpenseList } from "../ExpenseList";

const mockExpenses: ExpenseResponse[] = [
  {
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
    version: 0,
    created_at: "2026-06-15T10:00:00Z",
    created_by: "550e8400-e29b-41d4-a716-446655440999",
    tombstone: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440702",
    consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
    period_code: "202606",
    category_id: "550e8400-e29b-41d4-a716-446655440101",
    concept_id: "550e8400-e29b-41d4-a716-446655440201",
    item: "Ascensores mantenimiento",
    term: 1,
    total_terms: 1,
    provider_id: "550e8400-e29b-41d4-a716-446655440301",
    cost: { amount: "120000.00", currency: "ARS" },
    expense_type: "EXTRAORDINARIA",
    approval_status: "PENDING",
    hash: "b".repeat(64),
    version: 0,
    created_at: "2026-06-20T10:00:00Z",
    created_by: "550e8400-e29b-41d4-a716-446655440999",
    tombstone: false,
  },
];

describe("ExpenseList", () => {
  it("[@display] renders expense data in table with item, cost", () => {
    render(
      <MemoryRouter>
        <ExpenseList expenses={mockExpenses} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Luz enero")).toBeInTheDocument();
    expect(screen.getByText("Ascensores mantenimiento")).toBeInTheDocument();
    expect(screen.getByText("$ 45.000,00")).toBeInTheDocument();
    expect(screen.getByText("$ 120.000,00")).toBeInTheDocument();
  });

  it("[@display] shows expense type badges", () => {
    render(
      <MemoryRouter>
        <ExpenseList expenses={mockExpenses} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Ordinaria")).toBeInTheDocument();
    expect(screen.getByText("Extraordinaria")).toBeInTheDocument();
  });

  it("[@display] shows approval status badges", () => {
    render(
      <MemoryRouter>
        <ExpenseList expenses={mockExpenses} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Aprobado")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("[@display] links to detail page via Link component", () => {
    render(
      <MemoryRouter>
        <ExpenseList expenses={mockExpenses} isLoading={false} />
      </MemoryRouter>,
    );

    const detailLink = screen.getByRole("link", { name: "Luz enero" });
    expect(detailLink).toHaveAttribute("href", "/expenses/550e8400-e29b-41d4-a716-446655440701");
  });

  it("[@display] shows Ver links for each expense", () => {
    render(
      <MemoryRouter>
        <ExpenseList expenses={mockExpenses} isLoading={false} />
      </MemoryRouter>,
    );

    const verLinks = screen.getAllByText("Ver");
    expect(verLinks).toHaveLength(2);
  });

  it("[@display] shows period codes in table", () => {
    render(
      <MemoryRouter>
        <ExpenseList expenses={mockExpenses} isLoading={false} />
      </MemoryRouter>,
    );

    const periodElements = screen.getAllByText("202606");
    expect(periodElements.length).toBeGreaterThanOrEqual(2);
  });

  it("[@display] shows tombstone expense with strikethrough style", () => {
    const withTombstone = [
      {
        ...mockExpenses[0],
        tombstone: true,
        item: "Gasto anulado",
      },
    ];

    render(
      <MemoryRouter>
        <ExpenseList expenses={withTombstone} isLoading={false} />
      </MemoryRouter>,
    );

    const link = screen.getByText("Gasto anulado");
    expect(link.classList.contains("line-through")).toBe(true);
  });

  it("[@empty-state] shows empty message when data is []", () => {
    render(
      <MemoryRouter>
        <ExpenseList expenses={[]} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("No hay gastos registrados para este periodo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /registrar el primero/i })).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading", () => {
    render(
      <MemoryRouter>
        <ExpenseList expenses={[]} isLoading />
      </MemoryRouter>,
    );

    expect(
      screen.queryByText("No hay gastos registrados para este periodo"),
    ).not.toBeInTheDocument();
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows error with retry button when error prop present", () => {
    render(
      <MemoryRouter>
        <ExpenseList expenses={[]} isLoading={false} error={new Error("Network error")} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Error al cargar los gastos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
