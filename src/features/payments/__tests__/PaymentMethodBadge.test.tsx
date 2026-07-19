import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaymentMethodBadge } from "../PaymentMethodBadge";

describe("PaymentMethodBadge", () => {
  it("[@display] renders TRANSFER with green style", () => {
    const { container } = render(<PaymentMethodBadge method="TRANSFER" />);

    expect(screen.getByText("Transferencia")).toBeInTheDocument();
    expect(container.querySelector(".bg-green-100")).toBeInTheDocument();
  });

  it("[@display] renders DEPOSIT with blue style", () => {
    const { container } = render(<PaymentMethodBadge method="DEPOSIT" />);

    expect(screen.getByText("Depósito")).toBeInTheDocument();
    expect(container.querySelector(".bg-blue-100")).toBeInTheDocument();
  });

  it("[@display] renders CASH with gray style", () => {
    const { container } = render(<PaymentMethodBadge method="CASH" />);

    expect(screen.getByText("Efectivo")).toBeInTheDocument();
    expect(container.querySelector(".bg-neutral-100")).toBeInTheDocument();
  });

  it("[@display] renders MERCADOPAGO with orange style", () => {
    const { container } = render(<PaymentMethodBadge method="MERCADOPAGO" />);

    expect(screen.getByText("MercadoPago")).toBeInTheDocument();
    expect(container.querySelector(".bg-orange-100")).toBeInTheDocument();
  });

  it("[@display] renders OTHER with neutral style", () => {
    const { container } = render(<PaymentMethodBadge method="OTHER" />);

    expect(screen.getByText("Otro")).toBeInTheDocument();
    expect(container.querySelector(".bg-neutral-100")).toBeInTheDocument();
  });

  it("[@display] falls back to raw method label for unknown values", () => {
    render(<PaymentMethodBadge method="CRYPTO" />);

    expect(screen.getByText("CRYPTO")).toBeInTheDocument();
  });
});
