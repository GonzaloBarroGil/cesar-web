import type { CertificadoDeuda } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CertificadoDetail } from "../CertificadoDetail";

const mockCertificado: CertificadoDeuda = {
  id: "550e8400-e29b-41d4-a716-446655441001",
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  unit_id: "550e8400-e29b-41d4-a716-446655440050",
  total_debt: { amount: "25954.55", currency: "ARS" },
  period_breakdown: [
    { period_code: { code: "202606" }, amount: { amount: "20000.00", currency: "ARS" } },
    { period_code: { code: "202607" }, amount: { amount: "5954.55", currency: "ARS" } },
  ],
  issue_date: "2026-07-10T10:00:00Z",
  expires_at: "2026-10-10T10:00:00Z",
  administrator_signature: "Admin General",
  consejo_approval: "Aprobado en reunion 2026-07-05",
  status: "VIGENTE",
  is_executive_title: false,
  source_liquidacion_hashes: ["a".repeat(64), "b".repeat(64)],
  hash: "c".repeat(64),
};

describe("CertificadoDetail", () => {
  it("[@display] renders certificado header with status", () => {
    render(<CertificadoDetail certificado={mockCertificado} />);

    expect(screen.getByText("Certificado de Deuda")).toBeInTheDocument();
    expect(screen.getByText("Vigente")).toBeInTheDocument();
  });

  it("[@display] shows expires_at date", () => {
    render(<CertificadoDetail certificado={mockCertificado} />);

    expect(screen.getByText("10/10/2026")).toBeInTheDocument();
  });

  it("[@display] shows administrator_signature", () => {
    render(<CertificadoDetail certificado={mockCertificado} />);

    expect(screen.getByText("Admin General")).toBeInTheDocument();
  });

  it("[@display] shows 'Sin firma' when no signature", () => {
    const unsigned = { ...mockCertificado, administrator_signature: "" };

    render(<CertificadoDetail certificado={unsigned} />);

    expect(screen.getByText("Sin firma")).toBeInTheDocument();
  });

  it("[@display] shows consejo_approval", () => {
    render(<CertificadoDetail certificado={mockCertificado} />);

    expect(screen.getByText("Aprobado en reunion 2026-07-05")).toBeInTheDocument();
  });

  it("[@display] shows 'Titulo ejecutivo' badge when is_executive_title", () => {
    const ejecutivo = {
      ...mockCertificado,
      is_executive_title: true,
      status: "EJECUTADO" as const,
    };

    render(<CertificadoDetail certificado={ejecutivo} />);

    expect(screen.getByText("Titulo ejecutivo")).toBeInTheDocument();
  });

  it("[@display] shows period_breakdown", () => {
    render(<CertificadoDetail certificado={mockCertificado} />);

    expect(screen.getByText("202606")).toBeInTheDocument();
    expect(screen.getByText("202607")).toBeInTheDocument();
  });

  it("[@display] shows total_debt with MoneyDisplay", () => {
    render(<CertificadoDetail certificado={mockCertificado} />);

    expect(screen.getByText("$ 25.954,55")).toBeInTheDocument();
  });

  it("[@display] shows hash", () => {
    render(<CertificadoDetail certificado={mockCertificado} />);

    expect(screen.getByText("c".repeat(64))).toBeInTheDocument();
  });

  it("[@display] shows source liquidacion hashes", () => {
    render(<CertificadoDetail certificado={mockCertificado} />);

    expect(screen.getByText("a".repeat(64))).toBeInTheDocument();
    expect(screen.getByText("b".repeat(64))).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <CertificadoDetail certificado={mockCertificado}>
        <p>Contenido extra</p>
      </CertificadoDetail>,
    );

    expect(screen.getByText("Contenido extra")).toBeInTheDocument();
  });
});
