import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ReciboDetail } from "../ReciboDetail";

const mockRecibo = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  punto_venta: 1,
  numero_comprobante: 12345,
  tipo_comprobante: "9" as "9" | "015",
  status: "Activo" as "Activo" | "Anulado",
  importe_pagado: { amount: "15000.00", currency: "ARS" },
  fecha_emision: "2026-07-01T10:00:00Z",
  fecha_pago: "2026-07-01T10:00:00Z",
  medio_pago: "TRANSFERENCIA",
  factura_asociada_id: "550e8400-e29b-41d4-a716-446655449999",
  liquidacion_ref: null,
  created_at: "2026-07-01T10:00:00Z",
  updated_at: "2026-07-01T10:00:00Z",
};

describe("ReciboDetail", () => {
  it("[@display] renders recibo header with comprobante number", () => {
    render(
      <MemoryRouter>
        <ReciboDetail recibo={mockRecibo} />
      </MemoryRouter>,
    );

    expect(screen.getByText("0001-00012345")).toBeInTheDocument();
  });

  it("[@display] shows Recibo B type badge for tipo 9", () => {
    render(
      <MemoryRouter>
        <ReciboDetail recibo={mockRecibo} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Recibo B")).toBeInTheDocument();
  });

  it("[@display] shows Recibo C type badge for tipo 015", () => {
    const reciboC = { ...mockRecibo, tipo_comprobante: "015" as const };
    render(
      <MemoryRouter>
        <ReciboDetail recibo={reciboC} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Recibo C")).toBeInTheDocument();
  });

  it("[@display] shows active status badge", () => {
    render(
      <MemoryRouter>
        <ReciboDetail recibo={mockRecibo} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("[@display] shows Anulado with line-through and status badge", () => {
    const anulado = { ...mockRecibo, status: "Anulado" as const };
    render(
      <MemoryRouter>
        <ReciboDetail recibo={anulado} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Anulado")).toBeInTheDocument();
  });

  it("[@display] renders importe with MoneyDisplay", () => {
    render(
      <MemoryRouter>
        <ReciboDetail recibo={mockRecibo} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/15\.000/)).toBeInTheDocument();
  });

  it("[@display] shows dates in Argentine format", () => {
    render(
      <MemoryRouter>
        <ReciboDetail recibo={mockRecibo} />
      </MemoryRouter>,
    );

    const dates = screen.getAllByText(/1\/7\/2026|01\/07\/2026/);
    expect(dates).toHaveLength(2);
  });

  it("[@display] shows medio de pago", () => {
    render(
      <MemoryRouter>
        <ReciboDetail recibo={mockRecibo} />
      </MemoryRouter>,
    );

    expect(screen.getByText("TRANSFERENCIA")).toBeInTheDocument();
  });

  it("[@display] links to associated invoice", () => {
    render(
      <MemoryRouter>
        <ReciboDetail recibo={mockRecibo} />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: mockRecibo.factura_asociada_id });
    expect(link).toHaveAttribute("href", `/invoices/${mockRecibo.factura_asociada_id}`);
  });

  it("[@display] shows liquidacion reference when no factura", () => {
    const reciboConLiquidacion = {
      ...mockRecibo,
      factura_asociada_id: null,
      liquidacion_ref: "LIQ-001",
    };
    render(
      <MemoryRouter>
        <ReciboDetail recibo={reciboConLiquidacion} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Liquidacion LIQ-001")).toBeInTheDocument();
  });

  it("[@display] shows dash when no reference", () => {
    const sinRef = {
      ...mockRecibo,
      factura_asociada_id: null,
      liquidacion_ref: null,
    };
    render(
      <MemoryRouter>
        <ReciboDetail recibo={sinRef} />
      </MemoryRouter>,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
