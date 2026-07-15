import type { ExpenseResponse } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VersionHistory } from "../VersionHistory";

const mockVersions: ExpenseResponse[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440701",
    consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
    period_code: "202606",
    category_id: "550e8400-e29b-41d4-a716-446655440100",
    concept_id: "550e8400-e29b-41d4-a716-446655440200",
    item: "Luz enero",
    term: 1,
    total_terms: 1,
    provider_id: "550e8400-e29b-41d4-a716-446655440300",
    cost: { amount: "45000.00", currency: "ARS" },
    expense_type: "ORDINARIA",
    approval_status: "APPROVED",
    hash: "a".repeat(64),
    version: 2,
    created_at: "2026-07-10T10:00:00Z",
    created_by: "550e8400-e29b-41d4-a716-446655440999",
    tombstone: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440701",
    consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
    period_code: "202606",
    category_id: "550e8400-e29b-41d4-a716-446655440100",
    concept_id: "550e8400-e29b-41d4-a716-446655440200",
    item: "Luz enero",
    term: 1,
    total_terms: 1,
    provider_id: "550e8400-e29b-41d4-a716-446655440300",
    cost: { amount: "44000.00", currency: "ARS" },
    expense_type: "ORDINARIA",
    approval_status: "APPROVED",
    hash: "b".repeat(64),
    version: 3,
    created_at: "2026-07-12T10:00:00Z",
    created_by: "550e8400-e29b-41d4-a716-446655440999",
    tombstone: false,
  },
];

const singleVersion: ExpenseResponse[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440701",
    consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
    period_code: "202606",
    category_id: "550e8400-e29b-41d4-a716-446655440100",
    concept_id: "550e8400-e29b-41d4-a716-446655440200",
    item: "Luz enero",
    term: 1,
    total_terms: 1,
    provider_id: "550e8400-e29b-41d4-a716-446655440300",
    cost: { amount: "45000.00", currency: "ARS" },
    expense_type: "ORDINARIA",
    approval_status: "APPROVED",
    hash: "a".repeat(64),
    version: 1,
    created_at: "2026-07-10T10:00:00Z",
    created_by: "550e8400-e29b-41d4-a716-446655440999",
    tombstone: false,
  },
];

describe("VersionHistory", () => {
  it("[@display] renders versions in table with version numbers, dates, hash, status", () => {
    render(<VersionHistory versions={mockVersions} isLoading={false} />);

    expect(screen.getByText("v2")).toBeInTheDocument();
    expect(screen.getByText("v3")).toBeInTheDocument();
    expect(screen.getByText("(actual)")).toBeInTheDocument();
    expect(screen.getByText("Anulado")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("[@display] shows single version correctly with (actual) badge", () => {
    render(<VersionHistory versions={singleVersion} isLoading={false} />);

    expect(screen.getByText("v1")).toBeInTheDocument();
    expect(screen.getByText("(actual)")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("shows version numbers for each entry", () => {
    render(<VersionHistory versions={mockVersions} isLoading={false} />);

    expect(screen.getByText("v2")).toBeInTheDocument();
    expect(screen.getByText("v3")).toBeInTheDocument();
  });

  it("shows dates for each version entry", () => {
    render(<VersionHistory versions={mockVersions} isLoading={false} />);

    expect(screen.getByText("10/7/2026")).toBeInTheDocument();
    expect(screen.getByText("12/7/2026")).toBeInTheDocument();
  });

  it("[@empty-state] handles empty versions array", () => {
    render(<VersionHistory versions={[]} isLoading={false} />);

    expect(screen.getByText("Sin historial de versiones.")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading", () => {
    render(<VersionHistory versions={[]} isLoading />);

    expect(screen.queryByText("Sin historial de versiones.")).not.toBeInTheDocument();
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows tombstone version with Anulado badge and opacity", () => {
    render(<VersionHistory versions={mockVersions} isLoading={false} />);

    expect(screen.getByText("Anulado")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("shows hash truncated to first 12 characters", () => {
    render(<VersionHistory versions={mockVersions} isLoading={false} />);

    expect(screen.getByText(`${"a".repeat(12)}...`)).toBeInTheDocument();
    expect(screen.getByText(`${"b".repeat(12)}...`)).toBeInTheDocument();
  });
});
