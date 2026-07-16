import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { FacturaBForm } from "../FacturaBForm";

const VALID_CUIT = "20123456786";

function renderForm(onSubmit: (data: unknown) => void = () => {}, isSubmitting = false) {
  return render(
    <MemoryRouter>
      <FacturaBForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </MemoryRouter>,
  );
}

function fillItem(price: string) {
  fireEvent.change(screen.getByLabelText("Descripcion item 1"), {
    target: { value: "Limpieza general" },
  });
  fireEvent.change(screen.getByLabelText("Precio unitario item 1"), {
    target: { value: price },
  });
}

function fillCommonFields() {
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
}

describe("FacturaBForm", () => {
  it("[@display] marks CUIT as requerido when total >= $5000", () => {
    renderForm();

    fillItem("5000");

    expect(screen.getByText("CUIT Receptor (requerido)")).toBeInTheDocument();
    expect(
      screen.getByText("El CUIT es obligatorio para montos ≥ $5.000 o receptor mayorista."),
    ).toBeInTheDocument();
  });

  it("[@display] marks CUIT as opcional when total < $5000", () => {
    renderForm();

    fillItem("3000");

    expect(screen.getByText("CUIT Receptor (opcional)")).toBeInTheDocument();
    expect(
      screen.queryByText("El CUIT es obligatorio para montos ≥ $5.000 o receptor mayorista."),
    ).not.toBeInTheDocument();
  });

  it("[@display] IVA Contenido label is visible in totals", () => {
    renderForm();

    fillItem("12100");

    expect(screen.getByText("IVA Contenido (RG 5614/2024)")).toBeInTheDocument();
    expect(screen.getByText("$ 10.000,00")).toBeInTheDocument();
    expect(screen.getByText("$ 2.100,00")).toBeInTheDocument();
  });

  it("[@display] does NOT show per-item IVA rate selector", () => {
    renderForm();

    expect(screen.queryByLabelText("Alicuota IVA item 1")).not.toBeInTheDocument();
  });

  it("[@validation] requires CUIT on submit when total >= $5000", () => {
    renderForm();

    fillCommonFields();
    fillItem("35000");
    fireEvent.click(screen.getByRole("button", { name: /emitir factura b/i }));

    expect(screen.getByText("CUIT requerido para montos ≥ $5.000.")).toBeInTheDocument();
  });

  it("[@validation] validates CUIT format when filled", () => {
    renderForm();

    fillItem("5000");
    fireEvent.change(screen.getByLabelText(/CUIT Receptor/), {
      target: { value: "12345678901" },
    });
    fireEvent.click(screen.getByRole("button", { name: /emitir factura b/i }));

    expect(screen.getByText("CUIT invalido. Debe tener 11 digitos.")).toBeInTheDocument();
  });

  it("[@validation] rejects RI receptor for Factura B", () => {
    renderForm();

    fillCommonFields();
    fillItem("3000");
    fireEvent.change(screen.getByLabelText("Condicion IVA Receptor"), {
      target: { value: "RI" },
    });
    fireEvent.click(screen.getByRole("button", { name: /emitir factura b/i }));

    expect(screen.getByText("Para Factura B el receptor no puede ser RI.")).toBeInTheDocument();
  });

  it("[@happy-path] submits without CUIT when total < $5000", () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);

    fillCommonFields();
    fillItem("3000");
    fireEvent.click(screen.getByRole("button", { name: /emitir factura b/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
        receptor_cuit: null,
        receptor_condicion_iva: "CF",
      }),
    );
  });

  it("[@happy-path] submits with CUIT when total >= $5000", () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);

    fillCommonFields();
    fillItem("35000");
    fireEvent.change(screen.getByLabelText(/CUIT Receptor/), {
      target: { value: VALID_CUIT },
    });
    fireEvent.click(screen.getByRole("button", { name: /emitir factura b/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        receptor_cuit: VALID_CUIT,
      }),
    );
  });
});
