import type { PaymentResponse } from "@/api/generated/models";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RecentActivityFeed } from "../RecentActivityFeed";

const mockPayment: PaymentResponse = {
  id: "pay-1",
  consorcio_id: "c-1",
  unit_id: "UF-1A",
  period_code: "202606",
  payment_date: "2026-06-10",
  amount: { amount: "45000.00", currency: "ARS" },
  method: "TRANSFER",
  has_voucher: true,
  voucher_ref: "TRF-001",
  status: "ACTIVE",
  hash: "a".repeat(64),
  version: 1,
  created_at: "2026-06-10T10:00:00Z",
  created_by: "user-1",
  tombstone: false,
};

const mockPayment2: PaymentResponse = {
  ...mockPayment,
  id: "pay-2",
  payment_date: "2026-06-05",
  created_at: "2026-06-05T10:00:00Z",
  method: "CASH",
  amount: { amount: "20000.00", currency: "ARS" },
};

function renderFeed(payments: PaymentResponse[], loading = false) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <RecentActivityFeed payments={payments} loading={loading} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("RecentActivityFeed", () => {
  it("[@display] renders last 5 payments sorted by created_at descending", () => {
    renderFeed([mockPayment, mockPayment2]);

    expect(screen.getByText("Actividad Reciente")).toBeInTheDocument();
    const dates = screen.getAllByText(/\d{2}\/\d{2}\/\d{4}/);
    expect(dates.length).toBe(2);
  });

  it("[@loading] renders skeleton rows", () => {
    const { container } = renderFeed([], true);

    expect(screen.getByText("Actividad Reciente")).toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@empty-state] renders empty message when no payments", () => {
    renderFeed([]);

    expect(screen.getByText("Sin actividad reciente.")).toBeInTheDocument();
  });

  it("[@display] renders payment method badge", () => {
    renderFeed([mockPayment]);

    expect(screen.getByText("Transferencia")).toBeInTheDocument();
  });

  it("[@display] renders only first 5 payments", () => {
    const many = Array.from({ length: 10 }).map((_, i) => ({
      ...mockPayment,
      id: `pay-${i}`,
      created_at: `2026-06-${String(10 - i).padStart(2, "0")}T10:00:00Z`,
      payment_date: `2026-06-${String(10 - i).padStart(2, "0")}`,
    }));
    renderFeed(many);

    const dateElements = screen.getAllByText(/\d{2}\/\d{2}\/\d{4}/);
    expect(dateElements.length).toBe(5);
  });
});
