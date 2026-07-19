import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/incomes-outputs/incomes-outputs", () => ({
  useCancelEntry: vi.fn(),
  getGetEntryQueryKey: vi.fn((id: string) => [`/incomes-outputs/${id}`]),
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

import { useCancelEntry } from "@/api/generated/incomes-outputs/incomes-outputs";
import { CancelButton } from "../CancelButton";

const entryId = "550e8400-e29b-41d4-a716-446655441101";

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

function renderButton(status: string, user: typeof adminUser | typeof accountantUser) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MockAuthProvider authState={{ isAuthenticated: true, user }}>
        <CancelButton entryId={entryId} status={status} />
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("CancelButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCancelEntry).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useCancelEntry>>);
  });

  it("[@display] shown when status is ACTIVE and user is ADMIN", () => {
    renderButton("ACTIVE", adminUser);

    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("[@display] does NOT show when status is CANCELLED", () => {
    const { container } = renderButton("CANCELLED", adminUser);

    expect(container.textContent).toBe("");
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
  });

  it("[@display] does NOT show when user is ACCOUNTANT", () => {
    const { container } = renderButton("ACTIVE", accountantUser);

    expect(container.textContent).toBe("");
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
  });

  it("[@display] opens DEC-002 confirmation dialog on click", () => {
    renderButton("ACTIVE", adminUser);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByText("Cancelar movimiento")).toBeInTheDocument();
    expect(
      screen.getByText(
        "¿Cancelar este movimiento? Quedará marcado como anulado y no se incluirá en los resúmenes.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sí, cancelar" })).toBeInTheDocument();
  });

  it("[@display] dialog closes on Volver click", () => {
    renderButton("ACTIVE", adminUser);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(screen.getByRole("button", { name: "Volver" }));

    expect(screen.queryByText("Cancelar movimiento")).not.toBeInTheDocument();
  });

  it("[@happy-path] calls mutate with entryId and consorcio params when confirmed", () => {
    const mutate = vi.fn();
    vi.mocked(useCancelEntry).mockReturnValue({
      mutate,
      isPending: false,
    } as Partial<ReturnType<typeof useCancelEntry>>);
    renderButton("ACTIVE", adminUser);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, cancelar" }));

    expect(mutate).toHaveBeenCalledWith({
      entryId,
      params: { consorcio_id: "550e8400-e29b-41d4-a716-446655440001" },
    });
  });

  it("[@loading] disables button when mutation is pending", () => {
    vi.mocked(useCancelEntry).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as Partial<ReturnType<typeof useCancelEntry>>);
    renderButton("ACTIVE", adminUser);

    expect(screen.getByRole("button", { name: "Cancelando..." })).toBeDisabled();
  });
});
