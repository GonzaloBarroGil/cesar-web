import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExpenseFilters } from "../ExpenseFilters";
import type { FilterState } from "../ExpenseFilters";

const defaultFilters: FilterState = {
  period_code: "",
  type: "",
  status: "",
};

describe("ExpenseFilters", () => {
  it("renders all filter controls (period, type, status)", () => {
    render(<ExpenseFilters filters={defaultFilters} onFilterChange={() => {}} />);

    expect(screen.getByLabelText("Periodo")).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
    expect(screen.getByLabelText("Estado")).toBeInTheDocument();
  });

  it("displays current filter values", () => {
    const filters: FilterState = {
      period_code: "202606",
      type: "ORDINARIA",
      status: "APPROVED",
    };

    render(<ExpenseFilters filters={filters} onFilterChange={() => {}} />);

    const periodInput = screen.getByPlaceholderText("YYYYMM");
    expect(periodInput).toHaveDisplayValue("202606");

    const typeSelect = screen.getByLabelText("Tipo");
    expect(typeSelect).toHaveDisplayValue("Ordinaria");

    const statusSelect = screen.getByLabelText("Estado");
    expect(statusSelect).toHaveDisplayValue("Aprobado");
  });

  it("calls onFilterChange when period filter changes", () => {
    const onFilterChange = vi.fn();

    render(<ExpenseFilters filters={defaultFilters} onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByPlaceholderText("YYYYMM"), {
      target: { value: "202607" },
    });

    expect(onFilterChange).toHaveBeenCalledWith({
      period_code: "202607",
      type: "",
      status: "",
    });
  });

  it("calls onFilterChange when type filter changes", () => {
    const onFilterChange = vi.fn();

    render(<ExpenseFilters filters={defaultFilters} onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByLabelText("Tipo"), {
      target: { value: "EXTRAORDINARIA" },
    });

    expect(onFilterChange).toHaveBeenCalledWith({
      period_code: "",
      type: "EXTRAORDINARIA",
      status: "",
    });
  });

  it("calls onFilterChange when status filter changes", () => {
    const onFilterChange = vi.fn();

    render(<ExpenseFilters filters={defaultFilters} onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByLabelText("Estado"), {
      target: { value: "PENDING" },
    });

    expect(onFilterChange).toHaveBeenCalledWith({
      period_code: "",
      type: "",
      status: "PENDING",
    });
  });

  it("clear/reset button resets all filters", () => {
    const onFilterChange = vi.fn();

    render(<ExpenseFilters filters={defaultFilters} onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));

    expect(onFilterChange).toHaveBeenCalledWith({
      period_code: "",
      type: "",
      status: "",
    });
  });

  it("clear button resets even when filters have values", () => {
    const onFilterChange = vi.fn();
    const activeFilters: FilterState = {
      period_code: "202606",
      type: "ORDINARIA",
      status: "APPROVED",
    };

    render(<ExpenseFilters filters={activeFilters} onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));

    expect(onFilterChange).toHaveBeenCalledWith({
      period_code: "",
      type: "",
      status: "",
    });
  });

  it("type filter has options for Todos, Ordinaria, Extraordinaria", () => {
    render(<ExpenseFilters filters={defaultFilters} onFilterChange={() => {}} />);

    const typeTodos = screen.getByLabelText("Tipo").querySelectorAll("option");
    const typeTexts = Array.from(typeTodos).map((o) => o.textContent);
    expect(typeTexts).toContain("Todos");
    expect(typeTexts).toContain("Ordinaria");
    expect(typeTexts).toContain("Extraordinaria");
  });

  it("status filter has options for Pendiente, Aprobado, Rechazado", () => {
    render(<ExpenseFilters filters={defaultFilters} onFilterChange={() => {}} />);

    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Aprobado")).toBeInTheDocument();
    expect(screen.getByText("Rechazado")).toBeInTheDocument();
  });
});
