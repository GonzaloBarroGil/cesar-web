import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/expenses/expenses", () => ({
  useListProviders: vi.fn(),
  useRegisterProvider: vi.fn(),
  useUpdateProvider: vi.fn(),
}));

import {
  useListProviders,
  useRegisterProvider,
  useUpdateProvider,
} from "@/api/generated/expenses/expenses";
import { ProviderFormPage } from "../ProviderFormPage";

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

function renderPage(route = "/expenses/providers/new") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/expenses/providers/new" element={<ProviderFormPage />} />
          <Route path="/expenses/providers/:id/edit" element={<ProviderFormPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProviderFormPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRegisterProvider).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useRegisterProvider>>);
    vi.mocked(useUpdateProvider).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useUpdateProvider>>);
  });

  it("[@display] renders create form with ProviderForm", () => {
    vi.mocked(useListProviders).mockReturnValue({
      data: [],
      isLoading: false,
    } as Partial<ReturnType<typeof useListProviders>>);
    renderPage();

    expect(screen.getByText("Nuevo Proveedor")).toBeInTheDocument();
    expect(screen.getByText("CUIT")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
  });

  it("[@display] shows not found when editing missing provider", () => {
    vi.mocked(useListProviders).mockReturnValue({
      data: [],
      isLoading: false,
    } as Partial<ReturnType<typeof useListProviders>>);
    renderPage("/expenses/providers/nonexistent-id/edit");

    expect(screen.getByText("Proveedor no encontrado")).toBeInTheDocument();
    expect(screen.getByText("Volver")).toBeInTheDocument();
  });

  it("[@display] renders edit form with pre-filled data", () => {
    vi.mocked(useListProviders).mockReturnValue({
      data: [mockProvider],
      isLoading: false,
    } as Partial<ReturnType<typeof useListProviders>>);
    renderPage("/expenses/providers/p1/edit");

    expect(screen.getByText("Proveedores")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Edesur S.A.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30-12345678-9")).toBeInTheDocument();
  });
});
