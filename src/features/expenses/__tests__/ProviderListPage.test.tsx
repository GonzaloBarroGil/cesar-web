import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/expenses/expenses", () => ({
  useListProviders: vi.fn(),
  useTombstoneProvider: vi.fn(),
}));

import { useListProviders, useTombstoneProvider } from "@/api/generated/expenses/expenses";
import { ProviderListPage } from "../ProviderListPage";

const mockProvider = {
  id: "p1",
  cuit: "30-12345678-9",
  name: "Edesur S.A.",
  iva_condition: "RESPONSABLE_INSCRIPTO",
  provider_type: "SERVICIO",
  contact_email: "info@edesur.com",
  contact_phone: "0800-333-3333",
  tombstone: false,
  version: 0,
  created_at: "2026-01-01T00:00:00Z",
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ProviderListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProviderListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTombstoneProvider).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useTombstoneProvider>>);
  });

  it("[@display] renders ProviderList title", () => {
    vi.mocked(useListProviders).mockReturnValue({
      data: [mockProvider],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListProviders>>);
    renderPage();

    expect(screen.getByText("Proveedores")).toBeInTheDocument();
    expect(screen.getByText("Nuevo Proveedor")).toBeInTheDocument();
  });

  it("[@display] renders provider data", () => {
    vi.mocked(useListProviders).mockReturnValue({
      data: [mockProvider],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListProviders>>);
    renderPage();

    expect(screen.getByText("Edesur S.A.")).toBeInTheDocument();
    expect(screen.getByText("30-12345678-9")).toBeInTheDocument();
  });

  it("[@loading] shows loading skeleton", () => {
    vi.mocked(useListProviders).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as Partial<ReturnType<typeof useListProviders>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] shows error message", () => {
    vi.mocked(useListProviders).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("test error"),
    } as Partial<ReturnType<typeof useListProviders>>);
    renderPage();

    expect(screen.getByText("Error al cargar los proveedores")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
