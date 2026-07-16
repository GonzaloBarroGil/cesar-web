import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { InvoiceItemDraft } from "../InvoiceItems";
import { InvoiceTotals, computeTotal } from "../InvoiceTotals";

function item(
  precio: string,
  alicuota: InvoiceItemDraft["alicuota_iva"],
  cantidad = "1",
): InvoiceItemDraft {
  return { descripcion: "Item", cantidad, precio_unitario: precio, alicuota_iva: alicuota };
}

describe("InvoiceTotals", () => {
  it("computes neto_gravado_21 and iva_21 correctly", () => {
    render(
      <MemoryRouter>
        <InvoiceTotals items={[item("45000", "Veintiuno")]} variant="A" />
      </MemoryRouter>,
    );

    expect(screen.getByText("Neto Gravado 21%")).toBeInTheDocument();
    expect(screen.getByText("$ 45.000,00")).toBeInTheDocument();
    expect(screen.getByText("IVA 21%")).toBeInTheDocument();
    expect(screen.getByText("$ 9.450,00")).toBeInTheDocument();
  });

  it("computes neto_gravado_105 and iva_105 correctly", () => {
    render(
      <MemoryRouter>
        <InvoiceTotals items={[item("10000", "DiezComaCinco", "2")]} variant="A" />
      </MemoryRouter>,
    );

    expect(screen.getByText("Neto Gravado 10,5%")).toBeInTheDocument();
    expect(screen.getByText("$ 20.000,00")).toBeInTheDocument();
    expect(screen.getByText("IVA 10,5%")).toBeInTheDocument();
    expect(screen.getByText("$ 2.100,00")).toBeInTheDocument();
  });

  it("computes exento correctly with no IVA added", () => {
    render(
      <MemoryRouter>
        <InvoiceTotals items={[item("5000", "Exento")]} variant="A" />
      </MemoryRouter>,
    );

    expect(screen.getByText("Exento / No Gravado")).toBeInTheDocument();
    expect(screen.getAllByText("$ 5.000,00")).toHaveLength(2);
    expect(screen.queryByText("Neto Gravado 21%")).not.toBeInTheDocument();
  });

  it("computes total as sum of netos, IVA and exento", () => {
    const items = [item("45000", "Veintiuno"), item("5000", "Exento")];

    expect(computeTotal(items, "A")).toBeCloseTo(59450);

    render(
      <MemoryRouter>
        <InvoiceTotals items={items} variant="A" />
      </MemoryRouter>,
    );

    expect(screen.getByText("$ 59.450,00")).toBeInTheDocument();
  });

  it("groups IVA breakdown by rate for mixed items", () => {
    const items = [item("45000", "Veintiuno"), item("20000", "DiezComaCinco")];

    render(
      <MemoryRouter>
        <InvoiceTotals items={items} variant="A" />
      </MemoryRouter>,
    );

    expect(screen.getByText("Neto Gravado 21%")).toBeInTheDocument();
    expect(screen.getByText("Neto Gravado 10,5%")).toBeInTheDocument();
    expect(screen.getByText("$ 9.450,00")).toBeInTheDocument();
    expect(screen.getByText("$ 2.100,00")).toBeInTheDocument();
    expect(screen.getByText("$ 76.550,00")).toBeInTheDocument();
  });

  it("Factura B variant shows IVA contenido", () => {
    render(
      <MemoryRouter>
        <InvoiceTotals items={[item("12100", "Veintiuno")]} variant="B" />
      </MemoryRouter>,
    );

    expect(screen.getByText("Neto")).toBeInTheDocument();
    expect(screen.getByText("$ 10.000,00")).toBeInTheDocument();
    expect(screen.getByText("IVA Contenido (RG 5614/2024)")).toBeInTheDocument();
    expect(screen.getByText("$ 2.100,00")).toBeInTheDocument();
    expect(screen.getByText("$ 12.100,00")).toBeInTheDocument();
  });

  it("Factura C variant shows only total without IVA rows", () => {
    render(
      <MemoryRouter>
        <InvoiceTotals items={[item("15000", "Veintiuno")]} variant="C" />
      </MemoryRouter>,
    );

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("$ 15.000,00")).toBeInTheDocument();
    expect(screen.queryByText(/Neto Gravado/)).not.toBeInTheDocument();
    expect(screen.queryByText("IVA Contenido (RG 5614/2024)")).not.toBeInTheDocument();
  });
});
