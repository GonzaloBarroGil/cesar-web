import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
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
import type { IncomeOutputResponse } from "@/api/generated/models";
import { EntryList } from "../EntryList";

const adminUser = {
  id: "1",
  username: "admin",
  role: "ADMIN" as const,
  consorcio_id: null,
  nombre_completo: "Administrador General",
};

const baseEntry: IncomeOutputResponse = {
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

const tempOutputEntry: IncomeOutputResponse = {
  ...baseEntry,
  id: "550e8400-e29b-41d4-a716-446655441102",
  direction: "OUTPUT",
  sub_type: "OUTPUT_SALARY_TEMP",
  description: "Sueldo encargado",
  amount: { amount: "85000.00", currency: "ARS" },
  date: "2026-06-05",
};

const cancelledEntry: IncomeOutputResponse = {
  ...baseEntry,
  id: "550e8400-e29b-41d4-a716-446655441103",
  description: "Movimiento anulado",
  status: "CANCELLED",
  tombstone: true,
};

function renderList(props: Partial<React.ComponentProps<typeof EntryList>> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter initialEntries={["/incomes-outputs"]}>
          <Routes>
            <Route
              path="/incomes-outputs"
              element={<EntryList entries={[]} isLoading={false} error={null} {...props} />}
            />
            <Route path="/incomes-outputs/:id" element={<div>detail-probe</div>} />
          </Routes>
        </MemoryRouter>
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("EntryList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCancelEntry).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useCancelEntry>>);
  });

  it("[@display] renders table headers and entry rows", () => {
    renderList({ entries: [baseEntry] });

    expect(screen.getByText("Fecha")).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Dirección")).toBeInTheDocument();
    expect(screen.getByText("Monto")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("2026-06-10")).toBeInTheDocument();
    expect(screen.getByText("Alquiler de espacio publicitario")).toBeInTheDocument();
    expect(screen.getByText("Ingreso")).toBeInTheDocument();
    expect(screen.getByText("Alquiler")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("[@display] renders migration badge for _TEMP sub_type", () => {
    renderList({ entries: [tempOutputEntry] });

    expect(screen.getByText("Migración pendiente")).toBeInTheDocument();
    expect(screen.getByText("Egreso")).toBeInTheDocument();
    expect(screen.getByText("Salario (temp)")).toBeInTheDocument();
  });

  it("[@display] does NOT render migration badge for permanent sub_type", () => {
    renderList({ entries: [baseEntry] });

    expect(screen.queryByText("Migración pendiente")).not.toBeInTheDocument();
  });

  it("[@display] shows Cancelar action for ACTIVE entries", () => {
    renderList({ entries: [baseEntry] });

    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("[@display] greys out cancelled entries and hides Cancelar action", () => {
    renderList({ entries: [cancelledEntry] });

    const row = screen.getByText("Movimiento anulado").closest("tr");
    expect(row).toHaveClass("opacity-50");
    expect(screen.getByText("Movimiento anulado")).toHaveClass("line-through");
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
  });

  it("[@happy-path] navigates to detail when row is clicked", () => {
    renderList({ entries: [baseEntry] });

    fireEvent.click(screen.getByText("2026-06-10"));

    expect(screen.getByText("detail-probe")).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton", () => {
    renderList({ isLoading: true });

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@empty-state] renders empty state message", () => {
    renderList({ entries: [] });

    expect(screen.getByText("No hay movimientos registrados.")).toBeInTheDocument();
  });

  it("[@error-state] renders error message with retry button", () => {
    renderList({ error: new Error("network error") });

    expect(screen.getByText("Error al cargar los movimientos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
