import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/payments/payments", () => ({
  useListPayments: vi.fn(),
  useCreatePayment: vi.fn(),
  useGetUnitBalance: vi.fn(),
  useGetUnitPaymentHistory: vi.fn(),
  getListPaymentsQueryKey: vi.fn(() => ["/payments"]),
}));

vi.mock("@/features/layout/ConsorcioContext", () => ({
  useConsorcio: vi.fn(() => ({
    selectedId: "550e8400-e29b-41d4-a716-446655440001",
    consorcios: [],
    isLoading: false,
    select: vi.fn(),
  })),
}));

import {
  useCreatePayment,
  useGetUnitBalance,
  useGetUnitPaymentHistory,
  useListPayments,
} from "@/api/generated/payments/payments";
import { PaymentListPage } from "../PaymentListPage";

const mockPayment = {
  id: "550e8400-e29b-41d4-a716-446655440801",
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
  hash: "a".repeat(64),
  version: 1,
  created_at: "2026-06-10T10:00:00Z",
  created_by: "550e8400-e29b-41d4-a716-446655449999",
  tombstone: false,
};

const mockBalance = {
  total_debt: { amount: "50000.00", currency: "ARS" as const },
  total_paid: { amount: "45000.00", currency: "ARS" as const },
  outstanding: { amount: "5000.00", currency: "ARS" as const },
  overpayment: { amount: "0.00", currency: "ARS" as const },
};

function renderPage(initialEntry = "/payments") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <PaymentListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("PaymentListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreatePayment).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue(mockPayment),
      isPending: false,
    } as Partial<ReturnType<typeof useCreatePayment>>);
    vi.mocked(useGetUnitBalance).mockReturnValue({
      data: mockBalance,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetUnitBalance>>);
    vi.mocked(useGetUnitPaymentHistory).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetUnitPaymentHistory>>);
  });

  it("[@display] renders page title and tabs", () => {
    vi.mocked(useListPayments).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListPayments>>);
    renderPage();

    expect(screen.getByRole("heading", { name: "Pagos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pagos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Balances" })).toBeInTheDocument();
  });

  it("[@display] renders filters and Registrar Pago button", () => {
    vi.mocked(useListPayments).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListPayments>>);
    renderPage();

    expect(screen.getByPlaceholderText("YYYYMM")).toBeInTheDocument();
    expect(screen.getByLabelText("Estado")).toBeInTheDocument();
    expect(screen.getByLabelText("Unidad Funcional")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar Pago" })).toBeInTheDocument();
  });

  it("[@display] renders payment list with data", () => {
    vi.mocked(useListPayments).mockReturnValue({
      data: [mockPayment],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListPayments>>);
    renderPage();

    expect(screen.getByText("2026-06-10")).toBeInTheDocument();
    expect(screen.getByText("TRF-001234")).toBeInTheDocument();
    expect(screen.getByText("Transferencia")).toBeInTheDocument();
  });

  it("[@display] passes url filters to useListPayments", () => {
    vi.mocked(useListPayments).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListPayments>>);
    renderPage("/payments?period_code=202606&status=ACTIVE&unit_id=uf-1");

    expect(useListPayments).toHaveBeenCalledWith(
      expect.objectContaining({
        consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
        period_code: { code: "202606" },
        status: "ACTIVE",
        unit_id: "uf-1",
      }),
    );
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useListPayments).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as Partial<ReturnType<typeof useListPayments>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders error message", () => {
    vi.mocked(useListPayments).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("test error"),
    } as Partial<ReturnType<typeof useListPayments>>);
    renderPage();

    expect(screen.getByText("Error al cargar los pagos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("[@empty-state] renders empty state", () => {
    vi.mocked(useListPayments).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListPayments>>);
    renderPage();

    expect(screen.getByText("No hay pagos registrados.")).toBeInTheDocument();
  });

  it("[@happy-path] opens create modal on Registrar Pago click", () => {
    vi.mocked(useListPayments).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListPayments>>);
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Registrar Pago" }));

    expect(screen.getByRole("heading", { name: "Registrar Pago" })).toBeInTheDocument();
  });

  it("[@happy-path] balances tab shows UF selector and balance for selected unit", () => {
    vi.mocked(useListPayments).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListPayments>>);
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Balances" }));

    expect(screen.getByLabelText("Seleccionar unidad funcional")).toBeInTheDocument();
    expect(
      screen.getByText("Seleccione una unidad funcional para ver su balance."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Seleccionar unidad funcional"), {
      target: { value: "550e8400-e29b-41d4-a716-446655440101" },
    });

    expect(screen.getByText("Total pagado")).toBeInTheDocument();
    expect(screen.getByText("Sin historial de pagos para esta unidad.")).toBeInTheDocument();
  });
});
