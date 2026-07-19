import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/payments/payments", () => ({
  useGetUnitPaymentHistory: vi.fn(),
}));

vi.mock("@/features/layout/ConsorcioContext", () => ({
  useConsorcio: vi.fn(() => ({
    selectedId: "550e8400-e29b-41d4-a716-446655440001",
    consorcios: [],
    isLoading: false,
    select: vi.fn(),
  })),
}));

import { useGetUnitPaymentHistory } from "@/api/generated/payments/payments";
import { UnitHistoryTable } from "../UnitHistoryTable";

const unitId = "550e8400-e29b-41d4-a716-446655440101";

const entryJune = {
  payment_id: "550e8400-e29b-41d4-a716-446655440801",
  period_code: "202606",
  amount: { amount: "45000.00", currency: "ARS" as const },
  method: "TRANSFER" as const,
  payment_date: "2026-06-10",
  status: "ACTIVE" as const,
  no_voucher_warning: false,
};

const entryMay = {
  payment_id: "550e8400-e29b-41d4-a716-446655440802",
  period_code: "202605",
  amount: { amount: "30000.00", currency: "ARS" as const },
  method: "CASH" as const,
  payment_date: "2026-05-10",
  status: "REVERSED" as const,
  no_voucher_warning: true,
};

describe("UnitHistoryTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("[@display] renders history rows", () => {
    vi.mocked(useGetUnitPaymentHistory).mockReturnValue({
      data: [entryJune, entryMay],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetUnitPaymentHistory>>);
    render(<UnitHistoryTable unitId={unitId} />);

    expect(screen.getByText("2026-06-10")).toBeInTheDocument();
    expect(screen.getByText("2026-05-10")).toBeInTheDocument();
    expect(screen.getByText("Transferencia")).toBeInTheDocument();
    expect(screen.getByText("Efectivo")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByText("Revertido")).toBeInTheDocument();
  });

  it("[@display] renders NO_VOUCHER warning badge for entries with warning", () => {
    vi.mocked(useGetUnitPaymentHistory).mockReturnValue({
      data: [entryMay],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetUnitPaymentHistory>>);
    render(<UnitHistoryTable unitId={unitId} />);

    expect(screen.getByText("Sin comprobante")).toBeInTheDocument();
  });

  it("[@display] filters history by period_code", () => {
    vi.mocked(useGetUnitPaymentHistory).mockReturnValue({
      data: [entryJune, entryMay],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetUnitPaymentHistory>>);
    render(<UnitHistoryTable unitId={unitId} period_code="202606" />);

    expect(screen.getByText("2026-06-10")).toBeInTheDocument();
    expect(screen.queryByText("2026-05-10")).not.toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useGetUnitPaymentHistory).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetUnitPaymentHistory>>);
    render(<UnitHistoryTable unitId={unitId} />);

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@empty-state] renders empty state message", () => {
    vi.mocked(useGetUnitPaymentHistory).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetUnitPaymentHistory>>);
    render(<UnitHistoryTable unitId={unitId} />);

    expect(screen.getByText("Sin historial de pagos para esta unidad.")).toBeInTheDocument();
  });

  it("[@error-state] renders error message with retry button", () => {
    const refetch = vi.fn();
    vi.mocked(useGetUnitPaymentHistory).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("network"),
      refetch,
    } as Partial<ReturnType<typeof useGetUnitPaymentHistory>>);
    render(<UnitHistoryTable unitId={unitId} />);

    expect(screen.getByText("Error al cargar el historial")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
