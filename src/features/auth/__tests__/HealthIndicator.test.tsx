import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HealthIndicator } from "../HealthIndicator";

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

import { useQuery } from "@tanstack/react-query";

describe("HealthIndicator", () => {
  it("shows green dot when services are online", () => {
    vi.mocked(useQuery).mockReturnValue({
      data: { status: "ok" },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>);

    render(<HealthIndicator />);
    const dot = document.querySelector(".bg-green-500");
    expect(dot).toBeInTheDocument();
    expect(screen.getByText("Servicios operativos")).toBeInTheDocument();
  });

  it("shows yellow dot when services are degraded", () => {
    vi.mocked(useQuery).mockReturnValue({
      data: { status: "degraded" },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuery>);

    render(<HealthIndicator />);
    expect(document.querySelector(".bg-yellow-500")).toBeInTheDocument();
    expect(screen.getByText("Algunos servicios están degradados")).toBeInTheDocument();
  });

  it("shows red dot when health check fails", () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useQuery>);

    render(<HealthIndicator />);
    expect(document.querySelector(".bg-red-500")).toBeInTheDocument();
    expect(screen.getByText("Servicio no disponible")).toBeInTheDocument();
  });

  it("shows pulsing grey dot while loading", () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useQuery>);

    render(<HealthIndicator />);
    expect(document.querySelector(".bg-neutral-300")).toBeInTheDocument();
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
