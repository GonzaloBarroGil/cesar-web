import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { InvoiceItemDraft } from "../InvoiceItems";
import { InvoiceItems, emptyItem } from "../InvoiceItems";

const twoItems: InvoiceItemDraft[] = [
  {
    descripcion: "Mantenimiento ascensores",
    cantidad: "1",
    precio_unitario: "45000",
    alicuota_iva: "Veintiuno",
  },
  {
    descripcion: "Limpieza de tanques",
    cantidad: "2",
    precio_unitario: "1500",
    alicuota_iva: "DiezComaCinco",
  },
];

describe("InvoiceItems", () => {
  it("[@display] renders rows with description, quantity, price and IVA rate", () => {
    render(
      <MemoryRouter>
        <InvoiceItems items={twoItems} onChange={() => {}} showIva />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Descripcion item 1")).toHaveDisplayValue(
      "Mantenimiento ascensores",
    );
    expect(screen.getByLabelText("Cantidad item 2")).toHaveDisplayValue("2");
    expect(screen.getByLabelText("Precio unitario item 1")).toHaveDisplayValue("45000");
    expect(screen.getByLabelText("Alicuota IVA item 1")).toHaveDisplayValue("21%");
    expect(screen.getByLabelText("Alicuota IVA item 2")).toHaveDisplayValue("10,5%");
  });

  it("computes subtotal as qty x price", () => {
    render(
      <MemoryRouter>
        <InvoiceItems items={twoItems} onChange={() => {}} showIva />
      </MemoryRouter>,
    );

    expect(screen.getByText("$ 45.000,00")).toBeInTheDocument();
    expect(screen.getByText("$ 3.000,00")).toBeInTheDocument();
  });

  it("[@display] hides IVA column when showIva is false", () => {
    render(
      <MemoryRouter>
        <InvoiceItems items={twoItems} onChange={() => {}} showIva={false} />
      </MemoryRouter>,
    );

    expect(screen.queryByLabelText("Alicuota IVA item 1")).not.toBeInTheDocument();
  });

  it("[@display] add row button appends an empty item", () => {
    const onChange = vi.fn();

    render(
      <MemoryRouter>
        <InvoiceItems items={twoItems} onChange={onChange} showIva />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /agregar item/i }));

    expect(onChange).toHaveBeenCalledWith([...twoItems, emptyItem()]);
  });

  it("[@display] remove row button removes the item", () => {
    const onChange = vi.fn();

    render(
      <MemoryRouter>
        <InvoiceItems items={twoItems} onChange={onChange} showIva />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText("Quitar item 2"));

    expect(onChange).toHaveBeenCalledWith([twoItems[0]]);
  });

  it("does NOT show remove button when only one row", () => {
    render(
      <MemoryRouter>
        <InvoiceItems items={[emptyItem()]} onChange={() => {}} showIva />
      </MemoryRouter>,
    );

    expect(screen.queryByLabelText("Quitar item 1")).not.toBeInTheDocument();
  });

  it("calls onChange when a row field changes", () => {
    const onChange = vi.fn();

    render(
      <MemoryRouter>
        <InvoiceItems items={twoItems} onChange={onChange} showIva />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Descripcion item 1"), {
      target: { value: "Nuevo servicio" },
    });

    expect(onChange).toHaveBeenCalledWith([
      { ...twoItems[0], descripcion: "Nuevo servicio" },
      twoItems[1],
    ]);
  });
});
