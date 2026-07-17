import type { Liquidacion } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LiquidacionDetail } from "../LiquidacionDetail";

const mockLiquidacion: Liquidacion = {
  id: "550e8400-e29b-41d4-a716-446655440901",
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  period_code: { code: "202606" },
  unit_id: "550e8400-e29b-41d4-a716-446655440050",
  previous_balance: { amount: "5000.00", currency: "ARS" },
  expenses_breakdown: [],
  total_unit_expenses: { amount: "20000.00", currency: "ARS" },
  compensatory_interest: { amount: "500.00", currency: "ARS" },
  punitive_interest: { amount: "0.00", currency: "ARS" },
  round_off: { amount: "454.55", currency: "ARS" },
  total_debt: { amount: "25954.55", currency: "ARS" },
  payments_applied: { amount: "0.00", currency: "ARS" },
  current_balance: { amount: "25954.55", currency: "ARS" },
  liquidacion_number: "LC-202606-001",
  qr_code: "https://example.com/qr",
  status: "DRAFT",
  hash: "a".repeat(64),
  version: 1,
  generated_at: "2026-06-15T10:00:00Z",
  issued_at: null,
  created_at: "2026-06-15T10:00:00Z",
  tombstone: false,
};

describe("LiquidacionDetail", () => {
  it("[@display] renders liquidacion header with number and status badge", () => {
    render(<LiquidacionDetail liquidacion={mockLiquidacion} />);

    expect(screen.getByText("LC-202606-001")).toBeInTheDocument();
    expect(screen.getByText("Borrador")).toBeInTheDocument();
  });

  it("[@display] shows generated_at date", () => {
    render(<LiquidacionDetail liquidacion={mockLiquidacion} />);

    expect(screen.getByText(/Generada el/)).toBeInTheDocument();
  });

  it("[@display] shows issued_at date when present", () => {
    const issued = {
      ...mockLiquidacion,
      status: "ISSUED" as const,
      issued_at: "2026-07-02T10:00:00Z",
    };

    render(<LiquidacionDetail liquidacion={issued} />);

    expect(screen.getByText(/Emitida el/)).toBeInTheDocument();
  });

  it("[@display] shows period and unit in detail card", () => {
    render(<LiquidacionDetail liquidacion={mockLiquidacion} />);

    expect(screen.getByText("202606")).toBeInTheDocument();
    expect(screen.getByText("550e8400-e29b-41d4-a716-446655440050")).toBeInTheDocument();
  });

  it("[@display] shows version number", () => {
    render(<LiquidacionDetail liquidacion={mockLiquidacion} />);

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("[@display] shows current_balance with MoneyDisplay", () => {
    render(<LiquidacionDetail liquidacion={mockLiquidacion} />);

    expect(screen.getByText("$ 25.954,55")).toBeInTheDocument();
  });

  it("[@display] shows ISSUED status badge", () => {
    const issued = { ...mockLiquidacion, status: "ISSUED" as const };

    render(<LiquidacionDetail liquidacion={issued} />);

    expect(screen.getByText("Emitido")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <LiquidacionDetail liquidacion={mockLiquidacion}>
        <p>Contenido extra</p>
      </LiquidacionDetail>,
    );

    expect(screen.getByText("Contenido extra")).toBeInTheDocument();
  });
});
