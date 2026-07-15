import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProviderForm } from "../ProviderForm";
import type { ProviderFormData } from "../ProviderForm";

describe("ProviderForm", () => {
  it("renders all form fields for create mode", () => {
    render(<ProviderForm onSubmit={() => {}} isSubmitting={false} />);

    expect(screen.getByText("Nuevo Proveedor")).toBeInTheDocument();
    expect(screen.getByLabelText("CUIT")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
    expect(screen.getByLabelText("Condicion IVA")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Telefono")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear proveedor/i })).toBeInTheDocument();
  });

  it("[@validation] REQUIRED fields show errors on empty submit", () => {
    render(<ProviderForm onSubmit={() => {}} isSubmitting={false} />);

    fireEvent.click(screen.getByRole("button", { name: /crear proveedor/i }));

    expect(screen.getByText("CUIT invalido. Debe tener 11 digitos.")).toBeInTheDocument();
    expect(screen.getByText("El nombre es requerido.")).toBeInTheDocument();
  });

  it("[@validation] validates short CUIT", () => {
    render(<ProviderForm onSubmit={() => {}} isSubmitting={false} />);

    fireEvent.click(screen.getByRole("button", { name: /crear proveedor/i }));

    expect(screen.getByText("CUIT invalido. Debe tener 11 digitos.")).toBeInTheDocument();
  });

  it("[@happy-path] calls onSubmit with correct data", () => {
    const onSubmit = vi.fn();

    render(<ProviderForm onSubmit={onSubmit} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText("CUIT"), {
      target: { value: "30666666661" },
    });
    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "ELEVADORES SRL" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear proveedor/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        cuit: "30666666661",
        name: "ELEVADORES SRL",
        iva_condition: "RI",
        provider_type: "COMPANY",
      }),
    );
  });

  it("pre-fills fields in edit mode", () => {
    const initialData: Partial<ProviderFormData> = {
      cuit: "30666666661",
      name: "ELEVADORES SRL",
      iva_condition: "RI",
      provider_type: "COMPANY",
      contact_email: "info@elevadores.com",
      contact_phone: "1144440101",
    };

    render(<ProviderForm initialData={initialData} onSubmit={() => {}} isSubmitting={false} />);

    expect(screen.getByText("Editar Proveedor")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ELEVADORES SRL")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeInTheDocument();
  });

  it("shows server error when error prop is set", () => {
    render(
      <ProviderForm
        onSubmit={() => {}}
        isSubmitting={false}
        error="El CUIT ya esta registrado como proveedor"
      />,
    );

    expect(screen.getByText("El CUIT ya esta registrado como proveedor")).toBeInTheDocument();
  });

  it("disables submit button when submitting", () => {
    render(<ProviderForm onSubmit={() => {}} isSubmitting />);

    const button = screen.getByRole("button", { name: /guardando/i });
    expect(button).toBeDisabled();
  });

  it("has provider_type select with COMPANY and INDIVIDUAL", () => {
    render(<ProviderForm onSubmit={() => {}} isSubmitting={false} />);

    const typeSelect = screen.getByLabelText("Tipo");
    expect(typeSelect).toBeInTheDocument();
    expect(screen.getByText("Empresa")).toBeInTheDocument();
    expect(screen.getByText("Persona Fisica")).toBeInTheDocument();
  });
});
