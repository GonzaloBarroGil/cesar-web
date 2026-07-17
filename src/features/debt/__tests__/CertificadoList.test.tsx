import type { CertificadoDeuda } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CertificadoList } from "../CertificadoList";

const mockCertificados: CertificadoDeuda[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655441001",
    consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
    unit_id: "550e8400-e29b-41d4-a716-446655440050",
    total_debt: { amount: "25954.55", currency: "ARS" },
    period_breakdown: [
      { period_code: { code: "202606" }, amount: { amount: "25954.55", currency: "ARS" } },
    ],
    issue_date: "2026-07-10T10:00:00Z",
    expires_at: "2026-10-10T10:00:00Z",
    administrator_signature: "Admin General",
    consejo_approval: null,
    status: "VIGENTE",
    is_executive_title: false,
    source_liquidacion_hashes: [],
    hash: "a".repeat(64),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655441002",
    consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
    unit_id: "550e8400-e29b-41d4-a716-446655440051",
    total_debt: { amount: "47154.00", currency: "ARS" },
    period_breakdown: [
      { period_code: { code: "202607" }, amount: { amount: "47154.00", currency: "ARS" } },
    ],
    issue_date: "2026-07-15T10:00:00Z",
    expires_at: "2026-10-15T10:00:00Z",
    administrator_signature: "Admin General",
    consejo_approval: null,
    status: "EJECUTADO",
    is_executive_title: true,
    source_liquidacion_hashes: ["b".repeat(64)],
    hash: "c".repeat(64),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655441003",
    consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
    unit_id: "550e8400-e29b-41d4-a716-446655440052",
    total_debt: { amount: "15000.00", currency: "ARS" },
    period_breakdown: [
      { period_code: { code: "202605" }, amount: { amount: "15000.00", currency: "ARS" } },
    ],
    issue_date: "2026-06-01T10:00:00Z",
    expires_at: "2026-07-01T10:00:00Z",
    administrator_signature: "",
    consejo_approval: null,
    status: "VENCIDO",
    is_executive_title: false,
    source_liquidacion_hashes: [],
    hash: "d".repeat(64),
  },
];

describe("CertificadoList", () => {
  it("[@display] renders certificados in table with status badges", () => {
    render(
      <MemoryRouter>
        <CertificadoList certificados={mockCertificados} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Vigente")).toBeInTheDocument();
    expect(screen.getByText("Ejecutado")).toBeInTheDocument();
    expect(screen.getByText("Vencido")).toBeInTheDocument();
  });

  it("[@display] shows total_debt with MoneyDisplay", () => {
    render(
      <MemoryRouter>
        <CertificadoList certificados={mockCertificados} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("$ 25.954,55")).toBeInTheDocument();
    expect(screen.getByText("$ 47.154,00")).toBeInTheDocument();
    expect(screen.getByText("$ 15.000,00")).toBeInTheDocument();
  });

  it("[@display] shows Ver links for each certificado", () => {
    render(
      <MemoryRouter>
        <CertificadoList certificados={mockCertificados} isLoading={false} />
      </MemoryRouter>,
    );

    const verLinks = screen.getAllByText("Ver");
    expect(verLinks).toHaveLength(3);
  });

  it("[@display] links to detail page via MoneyDisplay link", () => {
    render(
      <MemoryRouter>
        <CertificadoList certificados={mockCertificados} isLoading={false} />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: /25.954,55/ });
    expect(link).toHaveAttribute("href", "/debt/certificados/550e8400-e29b-41d4-a716-446655441001");
  });

  it("[@empty-state] shows empty message when no certificados", () => {
    render(
      <MemoryRouter>
        <CertificadoList certificados={[]} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("No hay certificados de deuda.")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading", () => {
    render(
      <MemoryRouter>
        <CertificadoList certificados={[]} isLoading />
      </MemoryRouter>,
    );

    expect(screen.queryByText("No hay certificados de deuda.")).not.toBeInTheDocument();
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows error with retry button when error prop present", () => {
    render(
      <MemoryRouter>
        <CertificadoList certificados={[]} isLoading={false} error={new Error("Network error")} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Error al cargar los certificados")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
