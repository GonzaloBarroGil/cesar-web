import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MoneyDisplay } from "../MoneyDisplay";

describe("MoneyDisplay", () => {
  it("formats ARS amount correctly", () => {
    render(<MoneyDisplay amount={{ amount: "1500.50", currency: "ARS" }} />);
    expect(screen.getByText(/\$.*1\.500,50/)).toBeInTheDocument();
  });

  it("formats zero amount", () => {
    render(<MoneyDisplay amount={{ amount: "0.00", currency: "ARS" }} />);
    expect(screen.getByText(/\$.*0,00/)).toBeInTheDocument();
  });

  it("formats large amount with thousand separators", () => {
    render(<MoneyDisplay amount={{ amount: "1250000.75", currency: "ARS" }} />);
    expect(screen.getByText(/\$.*1\.250\.000,75/)).toBeInTheDocument();
  });

  it("shows green for positive when showColor is true", () => {
    const { container } = render(
      <MoneyDisplay amount={{ amount: "100.00", currency: "ARS" }} showColor />,
    );
    expect(container.firstChild).toHaveClass("text-green-600");
  });

  it("shows red for negative when showColor is true", () => {
    const { container } = render(
      <MoneyDisplay amount={{ amount: "-500.00", currency: "ARS" }} showColor />,
    );
    expect(container.firstChild).toHaveClass("text-red-600");
  });

  it("does not apply color class when showColor is false", () => {
    const { container } = render(<MoneyDisplay amount={{ amount: "100.00", currency: "ARS" }} />);
    expect(container.firstChild).not.toHaveClass("text-green-600");
    expect(container.firstChild).not.toHaveClass("text-red-600");
  });

  it("falls back to ARS when currency is missing", () => {
    render(<MoneyDisplay amount={{ amount: "200.00", currency: "" }} />);
    expect(screen.getByText(/\$.*200,00/)).toBeInTheDocument();
  });

  it("handles NaN gracefully by showing $ 0,00", () => {
    render(<MoneyDisplay amount={{ amount: "invalid", currency: "ARS" }} />);
    expect(screen.getByText(/\$.*0,00/)).toBeInTheDocument();
  });

  it("renders with tabular-nums class for aligned columns", () => {
    const { container } = render(<MoneyDisplay amount={{ amount: "100.00", currency: "ARS" }} />);
    expect(container.firstChild).toHaveClass("tabular-nums");
  });
});
