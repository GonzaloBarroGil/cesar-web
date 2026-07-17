import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/debt/debt", () => ({
  useListCertificados: vi.fn(),
  useGenerateCertificado: vi.fn(),
  getListCertificadosQueryKey: vi.fn(() => ["certificados"]),
}));

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: vi.fn(() => ({ user: { nombre_completo: "Administrador Test" } })),
}));

import { useGenerateCertificado, useListCertificados } from "@/api/generated/debt/debt";
import { CertificadoListPage } from "../CertificadoListPage";

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CertificadoListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CertificadoListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGenerateCertificado).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useGenerateCertificado>>);
  });

  it("[@display] renders page title and create button", () => {
    vi.mocked(useListCertificados).mockReturnValue({
      data: { certificados: [], count: 0 },
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListCertificados>>);
    renderPage();

    expect(screen.getByText("Certificados de Deuda")).toBeInTheDocument();
    expect(screen.getByText("Generar Certificado")).toBeInTheDocument();
    expect(screen.getByText("Deuda")).toBeInTheDocument();
  });

  it("[@display] renders filter input", () => {
    vi.mocked(useListCertificados).mockReturnValue({
      data: { certificados: [], count: 0 },
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListCertificados>>);
    renderPage();

    expect(screen.getByPlaceholderText("Filtrar por ID de unidad funcional")).toBeInTheDocument();
  });

  it("[@display] renders CertificadoList with data", () => {
    vi.mocked(useListCertificados).mockReturnValue({
      data: {
        certificados: [
          {
            id: "cert-1",
            consorcio_id: "cons-1",
            unit_id: "unit-1",
            total_debt: { amount: "45000.00", currency: "ARS" },
            period_breakdown: [],
            issue_date: "2026-06-15T10:00:00Z",
            expires_at: "2026-09-15T10:00:00Z",
            administrator_signature: "Admin",
            consejo_approval: null,
            status: "VIGENTE",
            is_executive_title: false,
            source_liquidacion_hashes: [],
            hash: "a".repeat(64),
          },
        ],
        count: 1,
      },
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListCertificados>>);
    renderPage();

    expect(screen.getByText("unit-1")).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useListCertificados).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as Partial<ReturnType<typeof useListCertificados>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders error message", () => {
    vi.mocked(useListCertificados).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("test error"),
    } as Partial<ReturnType<typeof useListCertificados>>);
    renderPage();

    expect(screen.getByText("Error al cargar los certificados")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
