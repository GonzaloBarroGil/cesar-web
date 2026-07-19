import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/incomes-outputs/incomes-outputs", () => ({
  useGetEntry: vi.fn(),
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

import { useCancelEntry, useGetEntry } from "@/api/generated/incomes-outputs/incomes-outputs";
import type { IncomeOutputResponse } from "@/api/generated/models";
import { EntryDetailPage } from "../EntryDetailPage";

const entryId = "550e8400-e29b-41d4-a716-446655441101";

const adminUser = {
  id: "1",
  username: "admin",
  role: "ADMIN" as const,
  consorcio_id: null,
  nombre_completo: "Administrador General",
};

const mockEntry: IncomeOutputResponse = {
  id: entryId,
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  period_code: "202606",
  direction: "INCOME",
  sub_type: "INCOME_RENT",
  date: "2026-06-10",
  amount: { amount: "35000.00", currency: "ARS" },
  description: "Alquiler de espacio publicitario",
  tags: [],
  status: "ACTIVE",
  hash: "d6e7f1a3b4c5".padEnd(64, "0"),
  version: 1,
  created_at: "2026-06-10T10:00:00Z",
  created_by: "550e8400-e29b-41d4-a716-446655449999",
  tombstone: false,
};

function renderPage(initialEntry = `/incomes-outputs/${entryId}`) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/incomes-outputs/:id" element={<EntryDetailPage />} />
          </Routes>
        </MemoryRouter>
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("EntryDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetEntry).mockReturnValue({
      data: mockEntry,
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetEntry>>);
    vi.mocked(useCancelEntry).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useCancelEntry>>);
  });

  it("[@display] renders back link, tabs, detail and cancel action", () => {
    renderPage();

    expect(screen.getByText("Movimientos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "General" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Historial" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Movimiento 550e8400" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("[@display] passes consorcio_id to useGetEntry", () => {
    renderPage();

    expect(useGetEntry).toHaveBeenCalledWith(
      entryId,
      { consorcio_id: "550e8400-e29b-41d4-a716-446655440001" },
      expect.anything(),
    );
  });

  it("[@display] hides cancel action for CANCELLED entries", () => {
    vi.mocked(useGetEntry).mockReturnValue({
      data: { ...mockEntry, status: "CANCELLED", tombstone: true },
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetEntry>>);
    renderPage();

    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
  });

  it("[@happy-path] Historial tab shows version history with current version", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Historial" }));

    expect(screen.getByText("v1")).toBeInTheDocument();
    expect(screen.getByText("(actual)")).toBeInTheDocument();
    expect(screen.getByText("d6e7f1a3b4c5...")).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useGetEntry).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as Partial<ReturnType<typeof useGetEntry>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders not-found state with back button", () => {
    vi.mocked(useGetEntry).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as Partial<ReturnType<typeof useGetEntry>>);
    renderPage();

    expect(screen.getByText("Movimiento no encontrado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver a Movimientos" })).toBeInTheDocument();
  });
});
