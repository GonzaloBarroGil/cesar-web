import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/invoices/invoices", () => ({
  useCreateFacturaC: vi.fn(),
}));

import { useCreateFacturaC } from "@/api/generated/invoices/invoices";
import { FacturaCCreatePage } from "../FacturaCCreatePage";

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
          <FacturaCCreatePage />
        </MemoryRouter>
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("FacturaCCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("[@display] renders back link and form", () => {
    vi.mocked(useCreateFacturaC).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useCreateFacturaC>>);
    renderPage();

    expect(screen.getByText("Facturación")).toBeInTheDocument();
    expect(screen.getByText("Nueva Factura C")).toBeInTheDocument();
    expect(screen.getByLabelText("ID Consorcio")).toBeInTheDocument();
  });
});
