import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/incomes-outputs/incomes-outputs", () => ({
  useCreateEntry: vi.fn(),
  getListEntriesQueryKey: vi.fn(() => ["/incomes-outputs"]),
}));

vi.mock("@/features/layout/ConsorcioContext", () => ({
  useConsorcio: vi.fn(() => ({
    selectedId: "550e8400-e29b-41d4-a716-446655440001",
    consorcios: [],
    isLoading: false,
    select: vi.fn(),
  })),
}));

import { useCreateEntry } from "@/api/generated/incomes-outputs/incomes-outputs";
import { EntryCreateModal } from "../EntryCreateModal";

function renderModal(props: Partial<React.ComponentProps<typeof EntryCreateModal>> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <EntryCreateModal open onOpenChange={() => {}} onSuccess={() => {}} {...props} />
    </QueryClientProvider>,
  );
}

function fillValidIncomeForm() {
  fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), { target: { value: "202606" } });
  fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2026-06-15" } });
  fireEvent.change(screen.getByLabelText("Monto (ARS)"), { target: { value: "35000" } });
  fireEvent.change(screen.getByLabelText("Descripción"), {
    target: { value: "Alquiler cartel hall" },
  });
}

describe("EntryCreateModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateEntry).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    } as Partial<ReturnType<typeof useCreateEntry>>);
  });

  it("renders nothing when closed", () => {
    renderModal({ open: false });

    expect(screen.queryByText("Nuevo Movimiento")).not.toBeInTheDocument();
  });

  it("[@display] renders form fields when open", () => {
    renderModal();

    expect(screen.getByRole("button", { name: "Ingreso" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Egreso" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
    expect(screen.getByLabelText("Periodo (YYYYMM)")).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha")).toBeInTheDocument();
    expect(screen.getByLabelText("Monto (ARS)")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar" })).toBeInTheDocument();
  });

  it("[@display] shows invoice field for default INCOME_RENT sub_type", () => {
    renderModal();

    expect(screen.getByLabelText("ID Factura (opcional)")).toBeInTheDocument();
  });

  it("[@display] hides invoice field for non INCOME_RENT sub_type", () => {
    renderModal();

    fireEvent.change(screen.getByLabelText("Tipo"), { target: { value: "INCOME_INSURANCE" } });

    expect(screen.queryByLabelText("ID Factura (opcional)")).not.toBeInTheDocument();
  });

  it("[@display] switching direction to Egreso swaps sub_type options and hides invoice field", () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Egreso" }));

    expect(screen.getByRole("option", { name: "Salario (temp)" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Inversión (temp)" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Legal (temp)" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Alquiler" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("ID Factura (opcional)")).not.toBeInTheDocument();
  });

  it("[@display] warns when date falls outside the period range", () => {
    renderModal();

    fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), { target: { value: "202606" } });
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2026-07-15" } });

    expect(screen.getByText("La fecha debe estar dentro del período 202606.")).toBeInTheDocument();
  });

  it("[@display] does not warn when date falls within the period range", () => {
    renderModal();

    fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), { target: { value: "202606" } });
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2026-06-15" } });

    expect(
      screen.queryByText("La fecha debe estar dentro del período 202606."),
    ).not.toBeInTheDocument();
  });

  it("[@error-state] shows validation error when period is missing", async () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    expect(await screen.findByText("El periodo (YYYYMM) es requerido.")).toBeInTheDocument();
  });

  it("[@error-state] shows validation error when amount is not positive", async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), { target: { value: "202606" } });
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2026-06-15" } });
    fireEvent.change(screen.getByLabelText("Monto (ARS)"), { target: { value: "0" } });

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    expect(await screen.findByText("El monto debe ser mayor a 0.")).toBeInTheDocument();
  });

  it("[@error-state] shows validation error when description is empty", async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), { target: { value: "202606" } });
    fireEvent.change(screen.getByLabelText("Fecha"), { target: { value: "2026-06-15" } });
    fireEvent.change(screen.getByLabelText("Monto (ARS)"), { target: { value: "35000" } });

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    expect(await screen.findByText("La descripción es requerida.")).toBeInTheDocument();
  });

  it("[@happy-path] submits INCOME entry with invoice link and calls onSuccess", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useCreateEntry).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
    } as Partial<ReturnType<typeof useCreateEntry>>);
    const onSuccess = vi.fn();
    renderModal({ onSuccess });

    fillValidIncomeForm();
    fireEvent.change(screen.getByLabelText("ID Factura (opcional)"), {
      target: { value: "550e8400-e29b-41d4-a716-446655440601" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await vi.waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        data: expect.objectContaining({
          consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
          period_code: { code: "202606" },
          direction: "INCOME",
          sub_type: "INCOME_RENT",
          date: "2026-06-15",
          amount: { amount: "35000.00", currency: "ARS" },
          description: "Alquiler cartel hall",
          invoice_id: "550e8400-e29b-41d4-a716-446655440601",
        }),
      });
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("[@happy-path] submits OUTPUT entry without invoice_id", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useCreateEntry).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
    } as Partial<ReturnType<typeof useCreateEntry>>);
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Egreso" }));
    fillValidIncomeForm();

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await vi.waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        data: expect.objectContaining({
          direction: "OUTPUT",
          sub_type: "OUTPUT_SALARY_TEMP",
        }),
      });
      const callArg = mutateAsync.mock.calls[0]?.[0] as { data: Record<string, unknown> };
      expect(callArg.data.invoice_id).toBeUndefined();
    });
  });

  it("[@error-state] shows error message when mutation fails", async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error("500"));
    vi.mocked(useCreateEntry).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
    } as Partial<ReturnType<typeof useCreateEntry>>);
    renderModal();

    fillValidIncomeForm();
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    expect(await screen.findByText("No se pudo registrar el movimiento.")).toBeInTheDocument();
  });

  it("[@loading] disables submit button when isPending", () => {
    vi.mocked(useCreateEntry).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: true,
    } as Partial<ReturnType<typeof useCreateEntry>>);
    renderModal();

    expect(screen.getByRole("button", { name: "Registrando..." })).toBeDisabled();
  });

  it("calls onOpenChange when close button clicked", () => {
    const onOpenChange = vi.fn();
    renderModal({ onOpenChange });

    const closeButtons = screen.getAllByLabelText("Cerrar");
    fireEvent.click(closeButtons[closeButtons.length - 1] as HTMLElement);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
