import type { Invoice } from "@/api/generated/models";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { NotaForm } from "../NotaForm";
import type { NotaMode } from "../NotaForm";

const parentInvoice: Invoice = {
  id: "550e8400-e29b-41d4-a716-446655440801",
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  tipo_comprobante: "001",
  punto_venta: 1,
  numero_comprobante: 1,
  cae: "12345678901234",
  cae_vencimiento: "2026-07-05",
  fecha_emision: "2026-06-05T00:00:00Z",
  fecha_vencimiento: null,
  emisor_cuit: "20123456786",
  emisor_razon_social: "Administracion Norte SA",
  emisor_domicilio: "Av. Corrientes 1234",
  emisor_condicion_iva: "RI",
  emisor_iibb: null,
  emisor_inicio_actividades: "2020-01-01",
  receptor_cuit: "20123456786",
  receptor_razon_social: "Consorcio Torre Norte",
  receptor_domicilio: "Av. Libertador 5678",
  receptor_condicion_iva: "RI",
  items: [],
  neto_gravado_21: { amount: "45000.00", currency: "ARS" },
  iva_21: { amount: "9450.00", currency: "ARS" },
  neto_gravado_105: { amount: "0.00", currency: "ARS" },
  iva_105: { amount: "0.00", currency: "ARS" },
  neto_gravado_27: { amount: "0.00", currency: "ARS" },
  iva_27: { amount: "0.00", currency: "ARS" },
  neto_exento: { amount: "0.00", currency: "ARS" },
  neto_no_gravado: { amount: "0.00", currency: "ARS" },
  otros_impuestos: [],
  importe_total: { amount: "54450.00", currency: "ARS" },
  iva_contenido: { amount: "9450.00", currency: "ARS" },
  qr_code: "https://qr.afip.gob.ar?cae=12345678901234",
  adicionales_rg: {},
  leyenda: null,
  status: "Activa",
  hash: "a".repeat(64),
  version: 1,
  created_at: "2026-06-05T09:00:00Z",
  created_by: "550e8400-e29b-41d4-a716-446655440999",
  tombstone: false,
};

function renderForm(
  mode: NotaMode,
  onSubmit: (data: unknown) => void = () => {},
  isSubmitting = false,
) {
  return render(
    <MemoryRouter>
      <NotaForm
        mode={mode}
        invoice={parentInvoice}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </MemoryRouter>,
  );
}

function fillValidNota(price: string) {
  fireEvent.change(screen.getByLabelText("CAE"), {
    target: { value: "98765432109876" },
  });
  fireEvent.change(screen.getByLabelText("Vencimiento CAE"), {
    target: { value: "2026-12-31" },
  });
  fireEvent.change(screen.getByLabelText("Descripcion item 1"), {
    target: { value: "Ajuste" },
  });
  fireEvent.change(screen.getByLabelText("Precio unitario item 1"), {
    target: { value: price },
  });
}

describe("NotaForm", () => {
  it("[@display] renders parent invoice summary", () => {
    renderForm("NC");

    expect(screen.getByText("Nueva Nota de Credito")).toBeInTheDocument();
    expect(screen.getByText("Comprobante asociado")).toBeInTheDocument();
    expect(screen.getByText("0001-00000001")).toBeInTheDocument();
    expect(screen.getByText("Consorcio Torre Norte")).toBeInTheDocument();
    expect(screen.getAllByText("$ 54.450,00").length).toBeGreaterThanOrEqual(1);
  });

  it("[@display] NC shows monto disponible", () => {
    renderForm("NC");

    expect(screen.getByText(/Monto disponible:/)).toBeInTheDocument();
  });

  it("[@display] NC renders motivo select with credit reasons", () => {
    renderForm("NC");

    const select = screen.getByLabelText("Motivo");
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Devolucion" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Descuento" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Cancelacion" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Error de facturacion" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Descuento posterior a facturacion" }),
    ).toBeInTheDocument();
  });

  it("[@display] ND renders motivo select with debit reasons", () => {
    renderForm("ND");

    expect(screen.getByText("Nueva Nota de Debito")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Cargo adicional" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Ajuste de precio" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Intereses" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Otro" })).toBeInTheDocument();
  });

  it("[@validation] NC rejects amount exceeding the disponible", () => {
    const onSubmit = vi.fn();
    renderForm("NC", onSubmit);

    fillValidNota("60000");
    fireEvent.click(screen.getByRole("button", { name: /emitir nota de credito/i }));

    expect(screen.getByText(/El monto supera el disponible/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("ND has no upper amount limit", () => {
    const onSubmit = vi.fn();
    renderForm("ND", onSubmit);

    fillValidNota("60000");
    fireEvent.click(screen.getByRole("button", { name: /emitir nota de debito/i }));

    expect(screen.queryByText(/El monto supera el disponible/)).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("[@validation] shows required errors on empty submit", () => {
    renderForm("NC");

    fireEvent.click(screen.getByRole("button", { name: /emitir nota de credito/i }));

    expect(
      screen.getByText("El CAE debe ser alfanumerico de al menos 10 caracteres."),
    ).toBeInTheDocument();
    expect(screen.getByText("El vencimiento del CAE es requerido.")).toBeInTheDocument();
    expect(
      screen.getByText("Cada item debe tener descripcion y precio mayor a 0."),
    ).toBeInTheDocument();
  });

  it("[@happy-path] calls onSubmit with motivo and inherited invoice data", () => {
    const onSubmit = vi.fn();
    renderForm("NC", onSubmit);

    fireEvent.change(screen.getByLabelText("Motivo"), {
      target: { value: "Discount" },
    });
    fillValidNota("10000");
    fireEvent.click(screen.getByRole("button", { name: /emitir nota de credito/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        motivo: "Discount",
        cae: "98765432109876",
        consorcio_id: parentInvoice.consorcio_id,
        emisor_cuit: parentInvoice.emisor_cuit,
        receptor_cuit: parentInvoice.receptor_cuit,
        receptor_condicion_iva: "RI",
      }),
    );
  });
});
