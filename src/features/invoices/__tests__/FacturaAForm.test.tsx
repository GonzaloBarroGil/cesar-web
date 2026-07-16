import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { FacturaAForm } from "../FacturaAForm";

const VALID_CUIT = "20123456786";

function renderForm(onSubmit: (data: unknown) => void = () => {}, isSubmitting = false) {
  return render(
    <MemoryRouter>
      <FacturaAForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </MemoryRouter>,
  );
}

function fillValidForm() {
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
  fireEvent.change(screen.getByLabelText("CUIT Receptor"), {
    target: { value: VALID_CUIT },
  });
  fireEvent.change(screen.getByLabelText("Razon Social Receptor"), {
    target: { value: "Juan Carlos López" },
  });
  fireEvent.change(screen.getByLabelText("Domicilio Receptor"), {
    target: { value: "Calle Falsa 123" },
  });
  fireEvent.change(screen.getByLabelText("Descripcion item 1"), {
    target: { value: "Mantenimiento ascensores" },
  });
  fireEvent.change(screen.getByLabelText("Precio unitario item 1"), {
    target: { value: "45000" },
  });
}

describe("FacturaAForm", () => {
  it("[@display] renders all fields: receptor CUIT, name, items, IVA rates", () => {
    renderForm();

    expect(screen.getByText("Nueva Factura A")).toBeInTheDocument();
    expect(screen.getByLabelText("ID Consorcio")).toBeInTheDocument();
    expect(screen.getByLabelText("Punto de Venta")).toBeInTheDocument();
    expect(screen.getByLabelText("CAE")).toBeInTheDocument();
    expect(screen.getByLabelText("Vencimiento CAE")).toBeInTheDocument();
    expect(screen.getByLabelText("CUIT Emisor")).toBeInTheDocument();
    expect(screen.getByLabelText("CUIT Receptor")).toBeInTheDocument();
    expect(screen.getByLabelText("Razon Social Receptor")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripcion item 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Alicuota IVA item 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /emitir factura a/i })).toBeInTheDocument();
  });

  it("[@display] receptor condicion IVA is fixed to RI", () => {
    renderForm();

    expect(screen.getByLabelText("Condicion IVA")).toBeDisabled();
    expect(screen.getByDisplayValue("RI — Responsable Inscripto")).toBeInTheDocument();
  });

  it("[@validation] shows required field errors on empty submit", () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /emitir factura a/i }));

    expect(screen.getByText("El consorcio es requerido.")).toBeInTheDocument();
    expect(
      screen.getByText("El CAE debe ser alfanumerico de al menos 10 caracteres."),
    ).toBeInTheDocument();
    expect(screen.getByText("CUIT del receptor es requerido para Factura A.")).toBeInTheDocument();
    expect(
      screen.getByText("Cada item debe tener descripcion y precio mayor a 0."),
    ).toBeInTheDocument();
  });

  it("[@validation] shows invalid CUIT error for malformed receptor CUIT", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("CUIT Receptor"), {
      target: { value: "12345678901" },
    });
    fireEvent.click(screen.getByRole("button", { name: /emitir factura a/i }));

    expect(screen.getByText("CUIT invalido. Debe tener 11 digitos.")).toBeInTheDocument();
  });

  it("[@happy-path] calls onSubmit with correct data", () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /emitir factura a/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
        cae: "12345678901234",
        cae_vencimiento: "2026-12-31",
        emisor_cuit: VALID_CUIT,
        receptor_cuit: VALID_CUIT,
        receptor_razon_social: "Juan Carlos López",
        items: [
          expect.objectContaining({
            descripcion: "Mantenimiento ascensores",
            cantidad: 1,
            precio_unitario: { amount: "45000.00", currency: "ARS" },
            alicuota_iva: "Veintiuno",
          }),
        ],
      }),
    );
  });

  it("[@display] InvoiceItems renders with add/remove rows", () => {
    renderForm();

    expect(screen.getByLabelText("Descripcion item 1")).toBeInTheDocument();
    expect(screen.queryByLabelText("Quitar item 1")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /agregar item/i }));

    expect(screen.getByLabelText("Descripcion item 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Quitar item 2")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Quitar item 2"));

    expect(screen.queryByLabelText("Descripcion item 2")).not.toBeInTheDocument();
  });

  it("[@display] InvoiceTotals computes IVA breakdown from items", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Descripcion item 1"), {
      target: { value: "Mantenimiento ascensores" },
    });
    fireEvent.change(screen.getByLabelText("Precio unitario item 1"), {
      target: { value: "45000" },
    });

    expect(screen.getByText("Neto Gravado 21%")).toBeInTheDocument();
    expect(screen.getByText("IVA 21%")).toBeInTheDocument();
    expect(screen.getByText("$ 9.450,00")).toBeInTheDocument();
    expect(screen.getByText("$ 54.450,00")).toBeInTheDocument();
  });

  it("disables submit button when submitting", () => {
    renderForm(() => {}, true);

    expect(screen.getByRole("button", { name: /emitiendo/i })).toBeDisabled();
  });
});
