import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/debt/debt", () => ({
  useGetCertificado: vi.fn(),
  useSignCertificado: vi.fn(),
  getGetCertificadoQueryKey: vi.fn(),
}));

import { useGetCertificado, useSignCertificado } from "@/api/generated/debt/debt";
import { CertificadoDetailPage } from "../CertificadoDetailPage";

const certificadoId = "550e8400-e29b-41d4-a716-446655440701";

const mockCertificado = {
  id: certificadoId,
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  unit_id: "550e8400-e29b-41d4-a716-446655440050",
  total_debt: { amount: "45000.00", currency: "ARS" },
  period_breakdown: [
    { period_code: { code: "202606" }, amount: { amount: "45000.00", currency: "ARS" } },
  ],
  issue_date: "2026-06-15T10:00:00Z",
  expires_at: "2026-09-15T10:00:00Z",
  administrator_signature: "Admin Test",
  consejo_approval: null,
  status: "VIGENTE",
  is_executive_title: false,
  source_liquidacion_hashes: ["a".repeat(64)],
  hash: "b".repeat(64),
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MockAuthProvider
        authState={{
          isAuthenticated: true,
          user: {
            id: "1",
            username: "admin",
            role: "ADMIN",
            consorcio_id: null,
            nombre_completo: "Administrador Test",
          },
        }}
      >
        <MemoryRouter initialEntries={[`/debt/certificados/${certificadoId}`]}>
          <Routes>
            <Route path="/debt/certificados/:id" element={<CertificadoDetailPage />} />
          </Routes>
        </MemoryRouter>
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("CertificadoDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSignCertificado).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useSignCertificado>>);
  });

  it("[@display] renders certificado detail with data", () => {
    vi.mocked(useGetCertificado).mockReturnValue({
      data: { certificado: mockCertificado },
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetCertificado>>);
    renderPage();

    expect(screen.getByText("Certificados")).toBeInTheDocument();
  });

  it("[@display] renders SignButton", () => {
    vi.mocked(useGetCertificado).mockReturnValue({
      data: { certificado: mockCertificado },
      isLoading: false,
      isError: false,
    } as Partial<ReturnType<typeof useGetCertificado>>);
    renderPage();

    expect(screen.getByText("Firmar")).toBeInTheDocument();
  });

  it("[@loading] renders loading skeleton", () => {
    vi.mocked(useGetCertificado).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as Partial<ReturnType<typeof useGetCertificado>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders not found message when error", () => {
    vi.mocked(useGetCertificado).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as Partial<ReturnType<typeof useGetCertificado>>);
    renderPage();

    expect(screen.getByText("Certificado no encontrado")).toBeInTheDocument();
    expect(screen.getByText("Volver a Certificados")).toBeInTheDocument();
  });
});
