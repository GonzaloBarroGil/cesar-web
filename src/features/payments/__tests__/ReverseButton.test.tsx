import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/payments/payments", () => ({
  useReversePayment: vi.fn(),
  getGetPaymentQueryKey: vi.fn((id: string) => [`/payments/${id}`]),
}));

import type { PaymentStatus } from "@/api/generated/models";
import { useReversePayment } from "@/api/generated/payments/payments";
import { ReverseButton } from "../ReverseButton";

const paymentId = "550e8400-e29b-41d4-a716-446655440801";

const adminUser = {
  id: "1",
  username: "admin",
  role: "ADMIN" as const,
  consorcio_id: null,
  nombre_completo: "Administrador General",
};

const accountantUser = {
  id: "2",
  username: "contador",
  role: "ACCOUNTANT" as const,
  consorcio_id: null,
  nombre_completo: "Contador",
};

function renderButton(status: PaymentStatus, user: typeof adminUser | typeof accountantUser) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MockAuthProvider authState={{ isAuthenticated: true, user }}>
        <ReverseButton paymentId={paymentId} status={status} />
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("ReverseButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useReversePayment).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useReversePayment>>);
  });

  it("[@display] shown when status is ACTIVE and user is ADMIN", () => {
    renderButton("ACTIVE", adminUser);

    expect(screen.getByRole("button", { name: "Revertir" })).toBeInTheDocument();
  });

  it("[@display] does NOT show when status is REVERSED", () => {
    const { container } = renderButton("REVERSED", adminUser);

    expect(container.textContent).toBe("");
    expect(screen.queryByRole("button", { name: "Revertir" })).not.toBeInTheDocument();
  });

  it("[@display] does NOT show when user is ACCOUNTANT", () => {
    const { container } = renderButton("ACTIVE", accountantUser);

    expect(container.textContent).toBe("");
    expect(screen.queryByRole("button", { name: "Revertir" })).not.toBeInTheDocument();
  });

  it("[@display] opens DEC-002 confirmation dialog on click", () => {
    renderButton("ACTIVE", adminUser);

    fireEvent.click(screen.getByRole("button", { name: "Revertir" }));

    expect(screen.getByText("Revertir pago")).toBeInTheDocument();
    expect(
      screen.getByText("¿Revertir este pago? Se creará un registro compensatorio."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Motivo (opcional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("[@display] dialog closes on cancel click", () => {
    renderButton("ACTIVE", adminUser);

    fireEvent.click(screen.getByRole("button", { name: "Revertir" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByText("Revertir pago")).not.toBeInTheDocument();
  });

  it("[@happy-path] calls mutate with default reason when confirmed", () => {
    const mutate = vi.fn();
    vi.mocked(useReversePayment).mockReturnValue({
      mutate,
      isPending: false,
    } as Partial<ReturnType<typeof useReversePayment>>);
    renderButton("ACTIVE", adminUser);

    fireEvent.click(screen.getByRole("button", { name: "Revertir" }));

    const reverseButtons = screen.getAllByRole("button", { name: "Revertir" });
    fireEvent.click(reverseButtons[reverseButtons.length - 1]);

    expect(mutate).toHaveBeenCalledWith({
      id: paymentId,
      data: { reason: "Reversión administrativa" },
    });
  });

  it("[@happy-path] calls mutate with typed reason when provided", () => {
    const mutate = vi.fn();
    vi.mocked(useReversePayment).mockReturnValue({
      mutate,
      isPending: false,
    } as Partial<ReturnType<typeof useReversePayment>>);
    renderButton("ACTIVE", adminUser);

    fireEvent.click(screen.getByRole("button", { name: "Revertir" }));
    fireEvent.change(screen.getByLabelText("Motivo (opcional)"), {
      target: { value: "Pago duplicado" },
    });

    const reverseButtons = screen.getAllByRole("button", { name: "Revertir" });
    fireEvent.click(reverseButtons[reverseButtons.length - 1]);

    expect(mutate).toHaveBeenCalledWith({
      id: paymentId,
      data: { reason: "Pago duplicado" },
    });
  });

  it("[@loading] disables button when mutation is pending", () => {
    vi.mocked(useReversePayment).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as Partial<ReturnType<typeof useReversePayment>>);
    renderButton("ACTIVE", adminUser);

    expect(screen.getByRole("button", { name: "Revirtiendo..." })).toBeDisabled();
  });
});
