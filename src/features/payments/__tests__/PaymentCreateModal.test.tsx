import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/payments/payments", () => ({
  useCreatePayment: vi.fn(),
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

import { useCreatePayment } from "@/api/generated/payments/payments";
import { PaymentCreateModal } from "../PaymentCreateModal";

function renderModal(props: Partial<React.ComponentProps<typeof PaymentCreateModal>> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <PaymentCreateModal open onOpenChange={() => {}} onSuccess={() => {}} {...props} />
    </QueryClientProvider>,
  );
}

describe("PaymentCreateModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreatePayment).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    } as Partial<ReturnType<typeof useCreatePayment>>);
  });

  it("renders nothing when closed", () => {
    renderModal({ open: false });

    expect(screen.queryByText("Registrar Pago")).not.toBeInTheDocument();
  });

  it("[@display] renders form fields when open", () => {
    renderModal();

    expect(screen.getByLabelText("ID Unidad Funcional")).toBeInTheDocument();
    expect(screen.getByLabelText("Periodo (YYYYMM)")).toBeInTheDocument();
    expect(screen.getByLabelText("Monto (ARS)")).toBeInTheDocument();
    expect(screen.getByLabelText("Medio de pago")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar" })).toBeInTheDocument();
  });

  it("[@display] hides voucher field for non-CASH methods", () => {
    renderModal();

    expect(screen.queryByLabelText("Numero de comprobante")).not.toBeInTheDocument();
  });

  it("[@display] shows voucher field when medio_pago is CASH", () => {
    renderModal();

    fireEvent.change(screen.getByLabelText("Medio de pago"), { target: { value: "CASH" } });

    expect(screen.getByLabelText("Numero de comprobante")).toBeInTheDocument();
  });

  it("[@error-state] shows validation error when required fields are empty", async () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    expect(
      await screen.findByText("La unidad funcional y el periodo son requeridos."),
    ).toBeInTheDocument();
  });

  it("[@error-state] shows validation error when amount is not positive", async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText("ID Unidad Funcional"), {
      target: { value: "550e8400-e29b-41d4-a716-446655440101" },
    });
    fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), {
      target: { value: "202606" },
    });
    fireEvent.change(screen.getByLabelText("Monto (ARS)"), { target: { value: "0" } });

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    expect(await screen.findByText("El monto debe ser mayor a 0.")).toBeInTheDocument();
  });

  it("[@happy-path] submits payment and calls onSuccess", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useCreatePayment).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
    } as Partial<ReturnType<typeof useCreatePayment>>);
    const onSuccess = vi.fn();
    renderModal({ onSuccess });

    fireEvent.change(screen.getByLabelText("ID Unidad Funcional"), {
      target: { value: "550e8400-e29b-41d4-a716-446655440101" },
    });
    fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), {
      target: { value: "202606" },
    });
    fireEvent.change(screen.getByLabelText("Monto (ARS)"), { target: { value: "1500" } });
    fireEvent.change(screen.getByLabelText("Medio de pago"), { target: { value: "CASH" } });
    fireEvent.change(screen.getByLabelText("Numero de comprobante"), {
      target: { value: "V-001" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await vi.waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        data: expect.objectContaining({
          consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
          unit_id: "550e8400-e29b-41d4-a716-446655440101",
          period_code: { code: "202606" },
          amount: { amount: "1500.00", currency: "ARS" },
          method: "CASH",
          has_voucher: true,
          voucher_ref: "V-001",
        }),
      });
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("[@happy-path] CASH without voucher submits has_voucher false", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useCreatePayment).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
    } as Partial<ReturnType<typeof useCreatePayment>>);
    renderModal();

    fireEvent.change(screen.getByLabelText("ID Unidad Funcional"), {
      target: { value: "550e8400-e29b-41d4-a716-446655440101" },
    });
    fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), {
      target: { value: "202606" },
    });
    fireEvent.change(screen.getByLabelText("Monto (ARS)"), { target: { value: "1500" } });
    fireEvent.change(screen.getByLabelText("Medio de pago"), { target: { value: "CASH" } });

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await vi.waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        data: expect.objectContaining({
          method: "CASH",
          has_voucher: false,
        }),
      });
    });
  });

  it("[@error-state] shows error message when mutation fails", async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error("500"));
    vi.mocked(useCreatePayment).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
    } as Partial<ReturnType<typeof useCreatePayment>>);
    renderModal();

    fireEvent.change(screen.getByLabelText("ID Unidad Funcional"), {
      target: { value: "550e8400-e29b-41d4-a716-446655440101" },
    });
    fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), {
      target: { value: "202606" },
    });
    fireEvent.change(screen.getByLabelText("Monto (ARS)"), { target: { value: "1500" } });

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    expect(await screen.findByText("No se pudo registrar el pago.")).toBeInTheDocument();
  });

  it("[@loading] disables submit button when isPending", () => {
    vi.mocked(useCreatePayment).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: true,
    } as Partial<ReturnType<typeof useCreatePayment>>);
    renderModal();

    expect(screen.getByRole("button", { name: "Registrando..." })).toBeDisabled();
  });

  it("calls onOpenChange when close button clicked", () => {
    const onOpenChange = vi.fn();
    renderModal({ onOpenChange });

    const closeButtons = screen.getAllByLabelText("Cerrar");
    fireEvent.click(closeButtons[0]);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
