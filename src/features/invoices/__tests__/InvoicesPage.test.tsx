import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({
  apiClient: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/api/generated/invoices/invoices", async () => {
  const actual = await vi.importActual<typeof import("@/api/generated/invoices/invoices")>(
    "@/api/generated/invoices/invoices",
  );
  return { ...actual, getInvoiceByCae: vi.fn() };
});

import { InvoicesPage } from "../InvoicesPage";

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
          <InvoicesPage />
        </MemoryRouter>
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("InvoicesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("[@display] renders page title and create buttons", () => {
    renderPage();

    expect(screen.getByText("Facturación")).toBeInTheDocument();
    expect(screen.getByText("Factura A")).toBeInTheDocument();
    expect(screen.getByText("Factura B")).toBeInTheDocument();
    expect(screen.getByText("Factura C")).toBeInTheDocument();
    expect(screen.getByText("Recibo")).toBeInTheDocument();
  });

  it("[@display] renders CAE search input", () => {
    renderPage();

    expect(screen.getByLabelText("Buscar por CAE")).toBeInTheDocument();
    expect(screen.getByText("Buscar")).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton while fetching", () => {
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
