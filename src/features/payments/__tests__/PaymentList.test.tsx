import type { PaymentResponse } from "@/api/generated/models";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PaymentList } from "../PaymentList";

const basePayment: PaymentResponse = {
  id: "550e8400-e29b-41d4-a716-446655440801",
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  unit_id: "550e8400-e29b-41d4-a716-446655440101",
  period_code: "202606",
  payment_date: "2026-06-10",
  amount: { amount: "45000.00", currency: "ARS" },
  method: "TRANSFER",
  has_voucher: true,
  voucher_ref: "TRF-001234",
  recibo_id: "550e8400-e29b-41d4-a716-446655440901",
  status: "ACTIVE",
  hash: "a".repeat(64),
  version: 1,
  created_at: "2026-06-10T10:00:00Z",
  created_by: "550e8400-e29b-41d4-a716-446655449999",
  tombstone: false,
};

const cashPaymentNoVoucher: PaymentResponse = {
  ...basePayment,
  id: "550e8400-e29b-41d4-a716-446655440802",
  method: "CASH",
  has_voucher: false,
  voucher_ref: undefined,
  recibo_id: undefined,
  payment_date: "2026-06-11",
};

function renderList(props: Partial<React.ComponentProps<typeof PaymentList>> = {}) {
  return render(
    <MemoryRouter initialEntries={["/payments"]}>
      <Routes>
        <Route
          path="/payments"
          element={<PaymentList payments={[]} isLoading={false} error={null} {...props} />}
        />
        <Route path="/payments/:id" element={<div>detail-probe</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PaymentList", () => {
  it("[@display] renders table headers and payment rows", () => {
    renderList({ payments: [basePayment] });

    expect(screen.getByText("Fecha")).toBeInTheDocument();
    expect(screen.getByText("Monto")).toBeInTheDocument();
    expect(screen.getByText("Medio de pago")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("2026-06-10")).toBeInTheDocument();
    expect(screen.getByText("TRF-001234")).toBeInTheDocument();
    expect(screen.getByText("Transferencia")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("[@display] renders NO_VOUCHER warning for CASH payment without voucher", () => {
    renderList({ payments: [cashPaymentNoVoucher] });

    expect(screen.getByText("Sin comprobante")).toBeInTheDocument();
    expect(screen.getByText("Efectivo")).toBeInTheDocument();
  });

  it("[@display] renders linked recibo as link", () => {
    renderList({ payments: [basePayment] });

    const reciboLink = screen.getByRole("link", { name: "550e8400" });
    expect(reciboLink).toHaveAttribute(
      "href",
      "/invoices/recibos/550e8400-e29b-41d4-a716-446655440901",
    );
  });

  it("[@happy-path] navigates to detail when row is clicked", () => {
    renderList({ payments: [basePayment] });

    fireEvent.click(screen.getByText("2026-06-10"));

    expect(screen.getByText("detail-probe")).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton", () => {
    renderList({ isLoading: true });

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@empty-state] renders empty state message", () => {
    renderList({ payments: [] });

    expect(screen.getByText("No hay pagos registrados.")).toBeInTheDocument();
  });

  it("[@error-state] renders error message with retry button", () => {
    renderList({ error: new Error("network error") });

    expect(screen.getByText("Error al cargar los pagos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
