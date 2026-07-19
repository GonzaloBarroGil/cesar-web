import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DirectionBadge } from "../DirectionBadge";

describe("DirectionBadge", () => {
  it("[@display] renders INCOME as Ingreso with green styling", () => {
    render(<DirectionBadge direction="INCOME" />);

    const badge = screen.getByText("Ingreso");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-green-100", "text-green-800");
  });

  it("[@display] renders OUTPUT as Egreso with red styling", () => {
    render(<DirectionBadge direction="OUTPUT" />);

    const badge = screen.getByText("Egreso");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-red-100", "text-red-800");
  });

  it("[@display] falls back to raw value with neutral styling for unknown direction", () => {
    render(<DirectionBadge direction="UNKNOWN" />);

    const badge = screen.getByText("UNKNOWN");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-neutral-100", "text-neutral-600");
  });
});
