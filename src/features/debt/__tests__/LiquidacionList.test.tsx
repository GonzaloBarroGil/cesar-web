import type { Liquidacion } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LiquidacionList } from "../LiquidacionList";

const mockMoney = { amount: "25954.55", currency: "ARS" as const };
const mockZero = { amount: "0.00", currency: "ARS" as const };

const mockLiquidaciones: Liquidacion[] = [
  {
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
    total_debt: mockMoney,
    payments_applied: mockZero,
    current_balance: mockMoney,
    liquidacion_number: "LC-202606-001",
    qr_code: "https://example.com/qr",
    status: "DRAFT",
    hash: "a".repeat(64),
    version: 1,
    generated_at: "2026-06-15T10:00:00Z",
    issued_at: null,
    created_at: "2026-06-15T10:00:00Z",
    tombstone: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440902",
    consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
    period_code: { code: "202607" },
    unit_id: "550e8400-e29b-41d4-a716-446655440051",
    previous_balance: mockMoney,
    expenses_breakdown: [],
    total_unit_expenses: { amount: "30000.00", currency: "ARS" },
    compensatory_interest: { amount: "1000.00", currency: "ARS" },
    punitive_interest: { amount: "200.00", currency: "ARS" },
    round_off: { amount: "-0.55", currency: "ARS" },
    total_debt: { amount: "57154.00", currency: "ARS" },
    payments_applied: { amount: "10000.00", currency: "ARS" },
    current_balance: { amount: "47154.00", currency: "ARS" },
    liquidacion_number: "LC-202607-002",
    qr_code: "https://example.com/qr2",
    status: "ISSUED",
    hash: "b".repeat(64),
    version: 2,
    generated_at: "2026-07-01T10:00:00Z",
    issued_at: "2026-07-02T10:00:00Z",
    created_at: "2026-07-01T10:00:00Z",
    tombstone: false,
  },
];

describe("LiquidacionList", () => {
  it("[@display] renders liquidacion data in table with status badges", () => {
    render(
      <MemoryRouter>
        <LiquidacionList liquidaciones={mockLiquidaciones} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Borrador")).toBeInTheDocument();
    expect(screen.getByText("Emitido")).toBeInTheDocument();
  });

  it("[@display] shows liquidacion_number as link to detail", () => {
    render(
      <MemoryRouter>
        <LiquidacionList liquidaciones={mockLiquidaciones} isLoading={false} />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "LC-202606-001" });
    expect(link).toHaveAttribute("href", "/debt/550e8400-e29b-41d4-a716-446655440901");
  });

  it("[@display] shows total_debt and current_balance with MoneyDisplay", () => {
    render(
      <MemoryRouter>
        <LiquidacionList liquidaciones={mockLiquidaciones} isLoading={false} />
      </MemoryRouter>,
    );

    const moneyElements = screen.getAllByText(/25.954,55/);
    expect(moneyElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/57.154,00/)).toBeInTheDocument();
    expect(screen.getByText(/47.154,00/)).toBeInTheDocument();
  });

  it("[@display] shows period codes in table", () => {
    render(
      <MemoryRouter>
        <LiquidacionList liquidaciones={mockLiquidaciones} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("202606")).toBeInTheDocument();
    expect(screen.getByText("202607")).toBeInTheDocument();
  });

  it("[@display] shows Ver links for each liquidacion", () => {
    render(
      <MemoryRouter>
        <LiquidacionList liquidaciones={mockLiquidaciones} isLoading={false} />
      </MemoryRouter>,
    );

    const verLinks = screen.getAllByText("Ver");
    expect(verLinks).toHaveLength(2);
  });

  it("[@empty-state] shows empty message when no liquidaciones", () => {
    render(
      <MemoryRouter>
        <LiquidacionList liquidaciones={[]} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("No hay liquidaciones. Genere la primera.")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading", () => {
    render(
      <MemoryRouter>
        <LiquidacionList liquidaciones={[]} isLoading />
      </MemoryRouter>,
    );

    expect(screen.queryByText("No hay liquidaciones. Genere la primera.")).not.toBeInTheDocument();
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows error with retry button when error prop present", () => {
    render(
      <MemoryRouter>
        <LiquidacionList liquidaciones={[]} isLoading={false} error={new Error("Network error")} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Error al cargar las liquidaciones")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
