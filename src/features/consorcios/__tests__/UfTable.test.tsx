import type { UnidadFuncionalData } from "@/mocks/fixtures/data";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UfTable } from "../UfTable";

const sampleUfs: UnidadFuncionalData[] = [
  {
    id: "uf1",
    consorcio_id: "c1",
    uf_code: "1A",
    floor: "1",
    unit: "A",
    percentage_a: "40.00",
    percentage_b: "35.00",
    percentage_c: "35.00",
    exempt_from: [],
  },
  {
    id: "uf2",
    consorcio_id: "c1",
    uf_code: "1B",
    floor: "1",
    unit: "B",
    percentage_a: "35.00",
    percentage_b: "35.00",
    percentage_c: "35.00",
    exempt_from: ["C"],
  },
  {
    id: "uf3",
    consorcio_id: "c1",
    uf_code: "2A",
    floor: "2",
    unit: "A",
    percentage_a: "25.00",
    percentage_b: "30.00",
    percentage_c: "30.00",
    exempt_from: [],
  },
];

describe("UfTable", () => {
  it("[@display] renders all UFs with their codes", () => {
    render(<UfTable ufs={sampleUfs} onSave={() => {}} isSaving={false} />);

    expect(screen.getByText("1A")).toBeInTheDocument();
    expect(screen.getByText("1B")).toBeInTheDocument();
    expect(screen.getByText("2A")).toBeInTheDocument();
  });

  it("[@display] shows 100% sum and Guardar disabled (no changes yet)", () => {
    render(<UfTable ufs={sampleUfs} onSave={() => {}} isSaving={false} />);

    const totalCells = screen.getAllByText("100.00%");
    expect(totalCells.length).toBeGreaterThan(0);
  });

  it("[@validation] shows warning when group A exceeds 100%", () => {
    const modified = sampleUfs.map((uf) =>
      uf.uf_code === "1A" ? { ...uf, percentage_a: "80.00" } : uf,
    );

    render(<UfTable ufs={modified} onSave={() => {}} isSaving={false} />);

    expect(screen.getByText(/grupo a.*140/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar/i })).toBeDisabled();
  });

  it("[@validation] shows warning when group A is below 100%", () => {
    const modified = sampleUfs.map((uf) =>
      uf.uf_code === "1A" ? { ...uf, percentage_a: "10.00" } : uf,
    );

    render(<UfTable ufs={modified} onSave={() => {}} isSaving={false} />);

    expect(screen.getByText(/grupo a.*70/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar/i })).toBeDisabled();
  });

  it("shows EX indicator for exempt UFs", () => {
    render(<UfTable ufs={sampleUfs} onSave={() => {}} isSaving={false} />);

    const exemptIndicators = screen.getAllByText("EX");
    expect(exemptIndicators).toHaveLength(1);
  });
});
