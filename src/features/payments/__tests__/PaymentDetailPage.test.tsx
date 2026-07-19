import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/payments/payments", () => ({
  useGetPayment: vi.fn(),
  useReversePayment: vi.fn(),
  getGetPaymentQueryKey: vi.fn((id: string) => [`/payments/${id}`]),
}));

import { useGetPayment, useReversePayment } from "@/api/generated/payments/payments";
import { PaymentDetailPage } from "../PaymentDetailPage";

const paymentId = "550e8400-e29b-41d4-a716-446655440801";

const mockPayment = {
  id: paymentId,
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  unit_id: "550e8400-e29b-41d4-a716-446655440101",
  period_code: "202606",
  payment_date: "2026-06-10",
  amount: { amount: "45000.00", currency: "ARS" as const },
  method: "TRANSFER" as const,
  has_voucher: true,
  voucher_ref: "TRF-001234",
  recibo_id: "550e8400-e29b-41d4-a716-446655440901",
  status: "ACTIVE" as const,
  hash: "b".repeat(64),
  version: 1,
  created_at: "2026-06-10T10:00:00Z",
  created_by: "550e8400-e29b-41d4-a716-446655449999",
  tombstone: false,
};

const adminUser = {
  id: "1",
  username: "admin",
  role: "ADMIN" as const,
  consorcio_id: null,
  nombre_completo: "Administrador General",
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter initialEntries={[`/payments/${paymentId}`]}>
          <Routes>
            <Route path="/payments/:id" element={<PaymentDetailPage />} />
          </Routes>
        </MemoryRouter>
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("PaymentDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useReversePayment).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useReversePayment>>);
  });

  it("[@display] renders payment detail with back link", () => {
    vi.mocked(useGetPayment).mockReturnValue({
      data: mockPayment,
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetPayment>>);
    renderPage();

    expect(screen.getByText("Pagos")).toBeInTheDocument();
    expect(screen.getByText("202606")).toBeInTheDocument();
    expect(screen.getByText("TRF-001234")).toBeInTheDocument();
    expect(screen.getByText("b".repeat(64))).toBeInTheDocument();
  });

  it("[@display] shows reverse button for ACTIVE payment", () => {
    vi.mocked(useGetPayment).mockReturnValue({
      data: mockPayment,
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetPayment>>);
    renderPage();

    expect(screen.getByRole("button", { name: "Revertir" })).toBeInTheDocument();
  });

  it("[@display] hides reverse button for REVERSED payment", () => {
    vi.mocked(useGetPayment).mockReturnValue({
      data: { ...mockPayment, status: "REVERSED" as const },
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetPayment>>);
    renderPage();

    expect(screen.queryByRole("button", { name: "Revertir" })).not.toBeInTheDocument();
  });

  it("[@display] shows Sin comprobante for CASH payment without voucher", () => {
    vi.mocked(useGetPayment).mockReturnValue({
      data: {
        ...mockPayment,
        method: "CASH" as const,
        has_voucher: false,
        voucher_ref: undefined,
      },
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetPayment>>);
    renderPage();

    expect(screen.getAllByText("Sin comprobante").length).toBeGreaterThan(0);
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useGetPayment).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as Partial<ReturnType<typeof useGetPayment>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders not found message when error", () => {
    vi.mocked(useGetPayment).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as Partial<ReturnType<typeof useGetPayment>>);
    renderPage();

    expect(screen.getByText("Pago no encontrado")).toBeInTheDocument();
    expect(screen.getByText("Volver a Pagos")).toBeInTheDocument();
  });
});
