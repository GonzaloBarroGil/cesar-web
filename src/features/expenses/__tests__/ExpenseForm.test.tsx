import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExpenseForm } from "../ExpenseForm";
import type { ExpenseFormData } from "../ExpenseForm";

describe("ExpenseForm", () => {
  it("renders all form fields for create mode", () => {
    render(<ExpenseForm onSubmit={() => {}} isSubmitting={false} />);

    expect(screen.getByText("Nuevo Gasto")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripcion")).toBeInTheDocument();
    expect(screen.getByLabelText("Costo (ARS)")).toBeInTheDocument();
    expect(screen.getByLabelText("Periodo (YYYYMM)")).toBeInTheDocument();
    expect(screen.getByLabelText("ID Consorcio")).toBeInTheDocument();
    expect(screen.getByLabelText("ID Concepto")).toBeInTheDocument();
    expect(screen.getByLabelText("ID Categoria")).toBeInTheDocument();
    expect(screen.getByLabelText("ID Proveedor")).toBeInTheDocument();
    expect(screen.getByLabelText("Terminos (cuotas)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear gasto/i })).toBeInTheDocument();
  });

  it("[@validation] shows required field errors on empty submit", () => {
    render(<ExpenseForm onSubmit={() => {}} isSubmitting={false} />);

    fireEvent.click(screen.getByRole("button", { name: /crear gasto/i }));

    expect(screen.getByText("La descripcion es requerida.")).toBeInTheDocument();
    expect(screen.getByText("El costo debe ser mayor a 0.")).toBeInTheDocument();
    expect(screen.getByText("El periodo es requerido.")).toBeInTheDocument();
    expect(screen.getByText("El consorcio es requerido.")).toBeInTheDocument();
  });

  it("[@validation] validates cost > 0", () => {
    render(<ExpenseForm onSubmit={() => {}} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText("Costo (ARS)"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("Descripcion"), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), {
      target: { value: "202606" },
    });
    fireEvent.change(screen.getByLabelText("ID Consorcio"), {
      target: { value: "550e8400-e29b-41d4-a716-446655440001" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear gasto/i }));

    expect(screen.getByText("El costo debe ser mayor a 0.")).toBeInTheDocument();
  });

  it("[@happy-path] calls onSubmit with correct ORDINARIA data", () => {
    const onSubmit = vi.fn();

    render(<ExpenseForm onSubmit={onSubmit} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText("Descripcion"), {
      target: { value: "Mantenimiento ascensores" },
    });
    fireEvent.change(screen.getByLabelText("Costo (ARS)"), {
      target: { value: "45000" },
    });
    fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), {
      target: { value: "202606" },
    });
    fireEvent.change(screen.getByLabelText("ID Consorcio"), {
      target: { value: "550e8400-e29b-41d4-a716-446655440001" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear gasto/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        item: "Mantenimiento ascensores",
        cost: "45000",
        expense_type: "ORDINARIA",
        period_code: "202606",
        consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
      }),
    );
  });

  it("toggles between ORDINARIA and EXTRAORDINARIA", () => {
    render(<ExpenseForm onSubmit={() => {}} isSubmitting={false} />);

    const ordinariaBtn = screen.getByRole("button", { name: "Ordinaria" });
    const extraordinariaBtn = screen.getByRole("button", { name: "Extraordinaria" });

    expect(ordinariaBtn.className).toContain("bg-green-50");
    expect(extraordinariaBtn.className).not.toContain("bg-amber-50");

    fireEvent.click(extraordinariaBtn);

    expect(ordinariaBtn.className).not.toContain("bg-green-50");
    expect(extraordinariaBtn.className).toContain("bg-amber-50");
  });

  it("shows approval notice when type is EXTRAORDINARIA", () => {
    render(<ExpenseForm onSubmit={() => {}} isSubmitting={false} />);

    expect(screen.queryByText("Requiere aprobacion.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Extraordinaria" }));

    expect(screen.getByText("Requiere aprobacion.")).toBeInTheDocument();
  });

  it("does NOT show approval notice when type is ORDINARIA", () => {
    render(<ExpenseForm onSubmit={() => {}} isSubmitting={false} />);

    expect(screen.queryByText("Requiere aprobacion.")).not.toBeInTheDocument();
  });

  it("pre-fills fields when initialData provided (edit mode)", () => {
    const initialData: Partial<ExpenseFormData> = {
      item: "Luz enero",
      cost: "32000",
      expense_type: "ORDINARIA",
      period_code: "202605",
      consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
      total_terms: 2,
    };

    render(<ExpenseForm initialData={initialData} onSubmit={() => {}} isSubmitting={false} />);

    expect(screen.getByText("Editar Gasto")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Luz enero")).toBeInTheDocument();
    expect(screen.getByDisplayValue("32000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("202605")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeInTheDocument();
  });

  it("shows server error when error prop is set", () => {
    render(
      <ExpenseForm onSubmit={() => {}} isSubmitting={false} error="No se pudo crear el gasto" />,
    );

    expect(screen.getByText("No se pudo crear el gasto")).toBeInTheDocument();
  });

  it("disables submit button when submitting", () => {
    render(<ExpenseForm onSubmit={() => {}} isSubmitting />);

    const button = screen.getByRole("button", { name: /guardando/i });
    expect(button).toBeDisabled();
  });

  it("shows multi-term field with default value 1", () => {
    render(<ExpenseForm onSubmit={() => {}} isSubmitting={false} />);

    const termsInput = screen.getByLabelText("Terminos (cuotas)");
    expect(termsInput).toHaveDisplayValue("1");
  });

  it("has min and max constraints on terms field", () => {
    render(<ExpenseForm onSubmit={() => {}} isSubmitting={false} />);

    const termsInput = screen.getByLabelText("Terminos (cuotas)");
    expect(termsInput).toHaveAttribute("min", "1");
    expect(termsInput).toHaveAttribute("max", "120");
  });
});
