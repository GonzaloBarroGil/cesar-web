import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/invoices/invoices", () => ({
  useCreateFacturaB: vi.fn(),
}));

import { useCreateFacturaB } from "@/api/generated/invoices/invoices";
import { FacturaBCreatePage } from "../FacturaBCreatePage";

const adminUser = {
  id: "1",
  username: "admin",
  role: "ADMIN" as const,
  consorcio_id: null,
  nombre_completo: "Administrador General",
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter>
          <FacturaBCreatePage />
        </MemoryRouter>
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("FacturaBCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("[@display] renders back link and form", () => {
    vi.mocked(useCreateFacturaB).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useCreateFacturaB>>);
    renderPage();

    expect(screen.getByText("Facturación")).toBeInTheDocument();
    expect(screen.getByText("Nueva Factura B")).toBeInTheDocument();
    expect(screen.getByLabelText("ID Consorcio")).toBeInTheDocument();
  });
});
