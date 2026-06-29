import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConsorcioForm } from "../ConsorcioForm";

describe("ConsorcioForm", () => {
  it("renders all form fields for create mode", () => {
    render(<ConsorcioForm onSubmit={() => {}} isSubmitting={false} />);

    expect(screen.getByLabelText("CUIT")).toBeInTheDocument();
    expect(screen.getByLabelText("Razón Social")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre Fantasía")).toBeInTheDocument();
    expect(screen.getByLabelText("Domicilio")).toBeInTheDocument();
    expect(screen.getByLabelText("Matrícula CABA")).toBeInTheDocument();
    expect(screen.getByLabelText("Condición IVA")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear consorcio/i })).toBeInTheDocument();
  });

  it("renders edit mode with pre-filled data", () => {
    const initialData = {
      id: "1",
      cuit: "30711111111",
      razon_social: "Consorcio Torre Norte",
      nombre_fantasia: "Torre Norte",
      matricula_caba: "MAT-2024-001234",
      domicilio: "Av. Corrientes 4500",
      iva_condition: "RI",
      status: "ACTIVE",
      created_at: "",
      updated_at: "",
    };

    render(<ConsorcioForm initialData={initialData} onSubmit={() => {}} isSubmitting={false} />);

    expect(screen.getByText("Editar Consorcio")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30711111111")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Consorcio Torre Norte")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeInTheDocument();
  });

  it("[@validation] shows error for invalid short CUIT", () => {
    render(<ConsorcioForm onSubmit={() => {}} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText("Razón Social"), {
      target: { value: "Test" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear consorcio/i }));

    expect(screen.getByText(/cuit inválido/i)).toBeInTheDocument();
  });

  it("[@validation] requires razón social", () => {
    render(<ConsorcioForm onSubmit={() => {}} isSubmitting={false} />);

    const cuitInput = screen.getByLabelText("CUIT");
    fireEvent.change(cuitInput, { target: { value: "30711111111" } });
    fireEvent.click(screen.getByRole("button", { name: /crear consorcio/i }));

    expect(screen.getByText(/razón social es requerida/i)).toBeInTheDocument();
  });

  it("calls onSubmit with form data when valid", () => {
    const onSubmit = vi.fn();

    render(<ConsorcioForm onSubmit={onSubmit} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText("CUIT"), {
      target: { value: "30711111112" },
    });
    fireEvent.change(screen.getByLabelText("Razón Social"), {
      target: { value: "Consorcio Test" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear consorcio/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ cuit: "30711111112", razon_social: "Consorcio Test" }),
    );
  });

  it("shows server error when error prop is set", () => {
    render(
      <ConsorcioForm onSubmit={() => {}} isSubmitting={false} error="El CUIT ya está registrado" />,
    );

    expect(screen.getByText("El CUIT ya está registrado")).toBeInTheDocument();
  });

  it("disables submit button when submitting", () => {
    render(<ConsorcioForm onSubmit={() => {}} isSubmitting />);

    expect(screen.getByRole("button", { name: /guardando/i })).toBeDisabled();
  });
});
