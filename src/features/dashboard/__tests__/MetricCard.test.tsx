import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MetricCard } from "../MetricCard";

describe("MetricCard", () => {
  it("[@display] renders title and formatted value", () => {
    render(
      <MetricCard
        title="Deuda Total"
        value="$ 45.000,00"
        description="2 liquidaciones activas"
        color="text-neutral-900"
      />,
    );

    expect(screen.getByText("Deuda Total")).toBeInTheDocument();
    expect(screen.getByText("$ 45.000,00")).toBeInTheDocument();
    expect(screen.getByText("2 liquidaciones activas")).toBeInTheDocument();
  });

  it("[@display] renders without description", () => {
    render(<MetricCard title="Tasa" value="85.5%" color="text-green-700" />);

    expect(screen.getByText("Tasa")).toBeInTheDocument();
    expect(screen.getByText("85.5%")).toBeInTheDocument();
  });

  it("[@loading] renders skeleton placeholders", () => {
    const { container } = render(<MetricCard title="Cargando" loading />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] renders error message with retry button", () => {
    const onRetry = vi.fn();
    render(<MetricCard title="Error Card" error onRetry={onRetry} />);

    expect(screen.getByText("No se pudo cargar.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("[@error-state] error state triggers onRetry on button click", () => {
    const onRetry = vi.fn();
    render(<MetricCard title="Error Card" error onRetry={onRetry} />);

    screen.getByRole("button", { name: "Reintentar" }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("[@empty-state] renders empty message", () => {
    render(<MetricCard title="Empty Card" empty emptyMessage="Sin liquidaciones generadas." />);

    expect(screen.getByText("Sin liquidaciones generadas.")).toBeInTheDocument();
  });

  it("[@empty-state] renders default empty message when none provided", () => {
    render(<MetricCard title="Empty Card" empty />);

    expect(screen.getByText("Sin datos.")).toBeInTheDocument();
  });

  it("[@happy-path] clickable card triggers onClick", () => {
    const onClick = vi.fn();
    render(<MetricCard title="Clickable" value="5" onClick={onClick} />);

    const card = screen.getByText("Clickable").closest('[role="button"]') as HTMLElement;
    card.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("[@display] non-clickable card does not have button role", () => {
    render(<MetricCard title="Static" value="10" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
