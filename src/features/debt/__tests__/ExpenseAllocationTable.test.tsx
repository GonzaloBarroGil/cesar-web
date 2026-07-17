import type { ExpenseAllocation } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExpenseAllocationTable } from "../ExpenseAllocationTable";

const mockAllocations: ExpenseAllocation[] = [
  {
    expense_id: "550e8400-e29b-41d4-a716-446655440701",
    expense_group: "MANTENIMIENTO",
    description: "Ascensores mantenimiento",
    total_cost: { amount: "120000.00", currency: "ARS" },
    distribution_type: "EQUAL",
    unit_percentage_applied: { value: "10.00" },
    unit_share: { amount: "12000.00", currency: "ARS" },
  },
  {
    expense_id: "550e8400-e29b-41d4-a716-446655440702",
    expense_group: "PERSONAL",
    description: "Sueldo encargado",
    total_cost: { amount: "80000.00", currency: "ARS" },
    distribution_type: "PERCENTAGE",
    unit_percentage_applied: { value: "8.33" },
    unit_share: { amount: "6664.00", currency: "ARS" },
  },
  {
    expense_id: "550e8400-e29b-41d4-a716-446655440703",
    expense_group: "OTROS",
    description: "Artículos de limpieza",
    total_cost: { amount: "5000.00", currency: "ARS" },
    distribution_type: "PERCENTAGE",
    unit_percentage_applied: { value: "8.33" },
    unit_share: { amount: "416.50", currency: "ARS" },
  },
];

describe("ExpenseAllocationTable", () => {
  it("[@display] renders allocations with description, group, distribution type", () => {
    render(<ExpenseAllocationTable allocations={mockAllocations} />);

    expect(screen.getByText("Ascensores mantenimiento")).toBeInTheDocument();
    expect(screen.getByText("Sueldo encargado")).toBeInTheDocument();
    expect(screen.getByText("Artículos de limpieza")).toBeInTheDocument();

    expect(screen.getByText("MANTENIMIENTO")).toBeInTheDocument();
    expect(screen.getByText("PERSONAL")).toBeInTheDocument();
    expect(screen.getByText("OTROS")).toBeInTheDocument();

    expect(screen.getByText("EQUAL")).toBeInTheDocument();
    expect(screen.getAllByText("PERCENTAGE")).toHaveLength(2);
  });

  it("[@display] shows percentage and unit_share", () => {
    render(<ExpenseAllocationTable allocations={mockAllocations} />);

    expect(screen.getByText("10.00%")).toBeInTheDocument();
    expect(screen.getAllByText("8.33%")).toHaveLength(2);

    expect(screen.getByText("$ 12.000,00")).toBeInTheDocument();
    expect(screen.getByText("$ 6.664,00")).toBeInTheDocument();
    expect(screen.getByText("$ 416,50")).toBeInTheDocument();
  });

  it("[@display] shows table headers", () => {
    render(<ExpenseAllocationTable allocations={mockAllocations} />);

    expect(screen.getByText("Descripcion")).toBeInTheDocument();
    expect(screen.getByText("Grupo")).toBeInTheDocument();
    expect(screen.getByText("Distribucion")).toBeInTheDocument();
    expect(screen.getByText("Porcentaje")).toBeInTheDocument();
    expect(screen.getByText("Parte de la UF")).toBeInTheDocument();
  });

  it("[@empty-state] shows 'Sin asignaciones' when empty", () => {
    render(<ExpenseAllocationTable allocations={[]} />);

    expect(screen.getByText("Sin asignaciones")).toBeInTheDocument();
  });
});
