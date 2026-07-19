import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/incomes-outputs/incomes-outputs", () => ({
  useListEntries: vi.fn(),
  useCreateEntry: vi.fn(),
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

import {
  useCancelEntry,
  useCreateEntry,
  useListEntries,
} from "@/api/generated/incomes-outputs/incomes-outputs";
import type { IncomeOutputResponse } from "@/api/generated/models";
import { EntryListPage } from "../EntryListPage";

const adminUser = {
  id: "1",
  username: "admin",
  role: "ADMIN" as const,
  consorcio_id: null,
  nombre_completo: "Administrador General",
};

const mockEntry: IncomeOutputResponse = {
  id: "550e8400-e29b-41d4-a716-446655441101",
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  period_code: "202606",
  direction: "INCOME",
  sub_type: "INCOME_RENT",
  date: "2026-06-10",
  amount: { amount: "35000.00", currency: "ARS" },
  description: "Alquiler de espacio publicitario",
  tags: [],
  status: "ACTIVE",
  hash: "a".repeat(64),
  version: 1,
  created_at: "2026-06-10T10:00:00Z",
  created_by: "550e8400-e29b-41d4-a716-446655449999",
  tombstone: false,
};

function renderPage(initialEntry = "/incomes-outputs") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <EntryListPage />
        </MemoryRouter>
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("EntryListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useListEntries).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListEntries>>);
    vi.mocked(useCreateEntry).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue(mockEntry),
      isPending: false,
    } as Partial<ReturnType<typeof useCreateEntry>>);
    vi.mocked(useCancelEntry).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useCancelEntry>>);
  });

  it("[@display] renders title, direction tabs and actions", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Ingresos/Egresos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Todos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Egresos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nuevo Movimiento" })).toBeInTheDocument();
    expect(screen.getByText("Resumen")).toBeInTheDocument();
  });

  it("[@display] renders filter inputs", () => {
    renderPage();

    expect(screen.getByPlaceholderText("Periodo (YYYYMM)")).toBeInTheDocument();
    expect(screen.getByLabelText("Desde")).toBeInTheDocument();
    expect(screen.getByLabelText("Hasta")).toBeInTheDocument();
  });

  it("[@display] renders entry rows with data", () => {
    vi.mocked(useListEntries).mockReturnValue({
      data: [mockEntry],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListEntries>>);
    renderPage();

    expect(screen.getByText("2026-06-10")).toBeInTheDocument();
    expect(screen.getByText("Alquiler de espacio publicitario")).toBeInTheDocument();
    expect(screen.getByText("Ingreso")).toBeInTheDocument();
  });

  it("[@display] passes url filters to useListEntries", () => {
    renderPage(
      "/incomes-outputs?direction=INCOME&period_code=202606&date_from=2026-06-01&date_to=2026-06-30",
    );

    expect(useListEntries).toHaveBeenCalledWith(
      expect.objectContaining({
        consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
        direction: "INCOME",
        period_code: { code: "202606" },
        date_from: "2026-06-01",
        date_to: "2026-06-30",
      }),
    );
  });

  it("[@happy-path] clicking a direction tab filters the list", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Egresos" }));

    expect(useListEntries).toHaveBeenLastCalledWith(
      expect.objectContaining({ direction: "OUTPUT" }),
    );
  });

  it("[@happy-path] opens create modal on Nuevo Movimiento click", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Nuevo Movimiento" }));

    expect(screen.getByRole("heading", { name: "Nuevo Movimiento" })).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useListEntries).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as Partial<ReturnType<typeof useListEntries>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders error message", () => {
    vi.mocked(useListEntries).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("test error"),
    } as Partial<ReturnType<typeof useListEntries>>);
    renderPage();

    expect(screen.getByText("Error al cargar los movimientos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("[@empty-state] renders empty state", () => {
    renderPage();

    expect(screen.getByText("No hay movimientos registrados.")).toBeInTheDocument();
  });
});
