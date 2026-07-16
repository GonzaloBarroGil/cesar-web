import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { FacturaCForm } from "../FacturaCForm";

const VALID_CUIT = "20123456786";

function renderForm(onSubmit: (data: unknown) => void = () => {}, isSubmitting = false) {
  return render(
    <MemoryRouter>
      <FacturaCForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </MemoryRouter>,
  );
}

describe("FacturaCForm", () => {
  it("[@display] does NOT show receptor CUIT field", () => {
    renderForm();

    expect(screen.getByText("Nueva Factura C")).toBeInTheDocument();
    expect(screen.queryByLabelText(/CUIT Receptor/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nombre Receptor (opcional)")).toBeInTheDocument();
  });

  it("[@display] does NOT show IVA discrimination", () => {
    renderForm();

    expect(screen.queryByLabelText("Alicuota IVA item 1")).not.toBeInTheDocument();
    expect(screen.queryByText(/Neto Gravado/)).not.toBeInTheDocument();
    expect(screen.queryByText("IVA Contenido (RG 5614/2024)")).not.toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("[@display] computes total from items", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Descripcion item 1"), {
      target: { value: "Servicio mensual" },
    });
    fireEvent.change(screen.getByLabelText("Precio unitario item 1"), {
      target: { value: "10000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /agregar item/i }));
    fireEvent.change(screen.getByLabelText("Descripcion item 2"), {
      target: { value: "Servicio adicional" },
    });
    fireEvent.change(screen.getByLabelText("Precio unitario item 2"), {
      target: { value: "5000" },
    });

    expect(screen.getByText("$ 15.000,00")).toBeInTheDocument();
  });

  it("[@validation] shows required field errors on empty submit", () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /emitir factura c/i }));

    expect(screen.getByText("El consorcio es requerido.")).toBeInTheDocument();
    expect(
      screen.getByText("Cada item debe tener descripcion y precio mayor a 0."),
    ).toBeInTheDocument();
  });

  it("[@happy-path] submits simplified form", () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);

    fireEvent.change(screen.getByLabelText("ID Consorcio"), {
      target: { value: "550e8400-e29b-41d4-a716-446655440001" },
    });
    fireEvent.change(screen.getByLabelText("CAE"), {
      target: { value: "12345678901234" },
    });
    fireEvent.change(screen.getByLabelText("Vencimiento CAE"), {
      target: { value: "2026-12-31" },
    });
    fireEvent.change(screen.getByLabelText("CUIT Emisor"), {
      target: { value: VALID_CUIT },
    });
    fireEvent.change(screen.getByLabelText("Razon Social Emisor"), {
      target: { value: "Administracion Norte SA" },
    });
    fireEvent.change(screen.getByLabelText("Domicilio Emisor"), {
      target: { value: "Av. Corrientes 1234" },
    });
    fireEvent.change(screen.getByLabelText("Inicio de Actividades"), {
      target: { value: "2020-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Descripcion item 1"), {
      target: { value: "Servicio mensual" },
    });
    fireEvent.change(screen.getByLabelText("Precio unitario item 1"), {
      target: { value: "5000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /emitir factura c/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
        emisor_condicion_iva: "MONOTRIBUTISTA",
        receptor_razon_social: null,
        items: [
          expect.objectContaining({
            descripcion: "Servicio mensual",
            precio_unitario: { amount: "5000.00", currency: "ARS" },
          }),
        ],
      }),
    );
  });
});
