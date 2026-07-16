import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ReciboForm } from "../ReciboForm";

const FACTURA_ID = "550e8400-e29b-41d4-a716-446655440801";

function renderForm(onSubmit: (data: unknown) => void = () => {}, isSubmitting = false) {
  return render(
    <MemoryRouter>
      <ReciboForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </MemoryRouter>,
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("ID Consorcio"), {
    target: { value: "550e8400-e29b-41d4-a716-446655440001" },
  });
  fireEvent.change(screen.getByLabelText("ID Factura"), {
    target: { value: FACTURA_ID },
  });
  fireEvent.change(screen.getByLabelText("Importe Pagado (ARS)"), {
    target: { value: "54450" },
  });
}

describe("ReciboForm", () => {
  it("[@display] renders reference toggle for factura and liquidacion", () => {
    renderForm();

    expect(screen.getByText("Nuevo Recibo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Factura" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Liquidacion" })).toBeInTheDocument();
    expect(screen.getByLabelText("ID Factura")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Liquidacion" }));

    expect(screen.getByLabelText("ID Liquidacion")).toBeInTheDocument();
    expect(screen.queryByLabelText("ID Factura")).not.toBeInTheDocument();
  });

  it("[@display] auto-selects Recibo B for RI consorcio", () => {
    renderForm();

    expect(screen.getByText("Recibo B")).toBeInTheDocument();
  });

  it("[@display] auto-selects Recibo C for EXENTO consorcio", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Condicion IVA del Consorcio"), {
      target: { value: "EXENTO" },
    });

    expect(screen.getByText("Recibo C")).toBeInTheDocument();
    expect(screen.queryByText("Recibo B")).not.toBeInTheDocument();
  });

  it("[@validation] shows required errors on empty submit", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Importe Pagado (ARS)"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /emitir recibo/i }));

    expect(screen.getByText("El consorcio es requerido.")).toBeInTheDocument();
    expect(screen.getByText("El importe debe ser mayor a 0.")).toBeInTheDocument();
    expect(screen.getByText("Debe referenciar una factura o una liquidacion.")).toBeInTheDocument();
  });

  it("[@happy-path] calls onSubmit with Recibo B data for factura reference", () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /emitir recibo/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
        tipo_comprobante: 9,
        importe_pagado: { amount: "54450.00", currency: "ARS" },
        medio_pago: "TRANSFERENCIA",
        factura_asociada_id: FACTURA_ID,
        liquidacion_ref: undefined,
      }),
    );
  });

  it("[@happy-path] submits Recibo C type when consorcio is EXENTO", () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);

    fillValidForm();
    fireEvent.change(screen.getByLabelText("Condicion IVA del Consorcio"), {
      target: { value: "EXENTO" },
    });
    fireEvent.click(screen.getByRole("button", { name: /emitir recibo/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo_comprobante: "015",
      }),
    );
  });

  it("pre-fills factura reference from initialFacturaId", () => {
    render(
      <MemoryRouter>
        <ReciboForm onSubmit={() => {}} isSubmitting={false} initialFacturaId={FACTURA_ID} />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("ID Factura")).toHaveDisplayValue(FACTURA_ID);
  });

  it("disables submit button when submitting", () => {
    render(
      <MemoryRouter>
        <ReciboForm onSubmit={() => {}} isSubmitting />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /emitiendo/i })).toBeDisabled();
  });
});
