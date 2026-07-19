import type { IncomeOutputResponse } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { EntryDetail } from "../EntryDetail";

const baseEntry: IncomeOutputResponse = {
  id: "550e8400-e29b-41d4-a716-446655441101",
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  period_code: "202606",
  direction: "INCOME",
  sub_type: "INCOME_RENT",
  date: "2026-06-10",
  amount: { amount: "35000.00", currency: "ARS" },
  description: "Alquiler de espacio publicitario",
  invoice_id: "550e8400-e29b-41d4-a716-446655440601",
  tags: [],
  status: "ACTIVE",
  hash: "d6e7f1a3b4c5".padEnd(64, "0"),
  version: 2,
  created_at: "2026-06-10T10:00:00Z",
  created_by: "550e8400-e29b-41d4-a716-446655449999",
  tombstone: false,
};

const tempOutputEntry: IncomeOutputResponse = {
  ...baseEntry,
  id: "550e8400-e29b-41d4-a716-446655441102",
  direction: "OUTPUT",
  sub_type: "OUTPUT_SALARY_TEMP",
  description: "Sueldo encargado",
  invoice_id: undefined,
};

function renderDetail(entry: IncomeOutputResponse = baseEntry) {
  return render(
    <MemoryRouter>
      <EntryDetail entry={entry} />
    </MemoryRouter>,
  );
}

describe("EntryDetail", () => {
  it("[@display] renders heading, badges and amount", () => {
    renderDetail();

    expect(screen.getByRole("heading", { name: "Movimiento 550e8400" })).toBeInTheDocument();
    expect(screen.getByText("Ingreso")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByText(/35\.000,00/)).toBeInTheDocument();
  });

  it("[@display] renders detail fields", () => {
    renderDetail();

    expect(screen.getByText("Alquiler de espacio publicitario")).toBeInTheDocument();
    expect(screen.getByText("Alquiler")).toBeInTheDocument();
    expect(screen.getByText("202606")).toBeInTheDocument();
    expect(screen.getByText("2026-06-10")).toBeInTheDocument();
    expect(screen.getByText("v2")).toBeInTheDocument();
    expect(screen.getByText(baseEntry.hash)).toBeInTheDocument();
  });

  it("[@display] renders invoice link for INCOME_RENT with invoice_id", () => {
    renderDetail();

    const invoiceLink = screen.getByRole("link", { name: "550e8400" });
    expect(invoiceLink).toHaveAttribute("href", "/invoices/550e8400-e29b-41d4-a716-446655440601");
  });

  it("[@display] renders dash when there is no linked invoice", () => {
    renderDetail(tempOutputEntry);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("[@display] renders migration badge for _TEMP sub_type", () => {
    renderDetail(tempOutputEntry);

    expect(screen.getByText("Migración pendiente")).toBeInTheDocument();
    expect(screen.getByText("Egreso")).toBeInTheDocument();
    expect(screen.getByText("Salario (temp)")).toBeInTheDocument();
  });
});
