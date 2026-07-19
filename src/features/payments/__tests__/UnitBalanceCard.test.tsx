import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/payments/payments", () => ({
  useGetUnitBalance: vi.fn(),
}));

vi.mock("@/features/layout/ConsorcioContext", () => ({
  useConsorcio: vi.fn(() => ({
    selectedId: "550e8400-e29b-41d4-a716-446655440001",
    consorcios: [],
    isLoading: false,
    select: vi.fn(),
  })),
}));

import { useGetUnitBalance } from "@/api/generated/payments/payments";
import { UnitBalanceCard } from "../UnitBalanceCard";

const unitId = "550e8400-e29b-41d4-a716-446655440101";

const mockBalance = {
  total_debt: { amount: "50000.00", currency: "ARS" as const },
  total_paid: { amount: "45000.00", currency: "ARS" as const },
  outstanding: { amount: "5000.00", currency: "ARS" as const },
  overpayment: { amount: "0.00", currency: "ARS" as const },
};

describe("UnitBalanceCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("[@display] renders balance summary", () => {
    vi.mocked(useGetUnitBalance).mockReturnValue({
      data: mockBalance,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetUnitBalance>>);
    render(<UnitBalanceCard unitId={unitId} />);

    expect(screen.getByText("Balance de unidad")).toBeInTheDocument();
    expect(screen.getByText("Total pagado")).toBeInTheDocument();
    expect(screen.getByText("Deuda total")).toBeInTheDocument();
    expect(screen.getByText("Saldo pendiente")).toBeInTheDocument();
    expect(screen.getByText("Sobrepago")).toBeInTheDocument();
  });

  it("[@display] passes consorcio_id to the balance query", () => {
    vi.mocked(useGetUnitBalance).mockReturnValue({
      data: mockBalance,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetUnitBalance>>);
    render(<UnitBalanceCard unitId={unitId} />);

    expect(useGetUnitBalance).toHaveBeenCalledWith(unitId, {
      consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
    });
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useGetUnitBalance).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useGetUnitBalance>>);
    render(<UnitBalanceCard unitId={unitId} />);

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders error message with retry button", () => {
    const refetch = vi.fn();
    vi.mocked(useGetUnitBalance).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("not found"),
      refetch,
    } as Partial<ReturnType<typeof useGetUnitBalance>>);
    render(<UnitBalanceCard unitId={unitId} />);

    expect(screen.getByText("Error al cargar el balance")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
