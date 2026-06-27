import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "../AppShell";

const adminUser = {
  id: "1",
  username: "admin",
  role: "ADMIN" as const,
  consorcio_id: null,
  nombre_completo: "Administrador General",
};

const mockMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter>{children}</MemoryRouter>
      </MockAuthProvider>
    </QueryClientProvider>
  );
}

describe("AppShell", () => {
  it("[@display] renders CESAR branding in sidebar", () => {
    mockMatchMedia(true);
    render(<AppShell />, { wrapper });
    expect(screen.getByText("CESAR")).toBeInTheDocument();
  });

  it("[@display] renders version in footer", () => {
    mockMatchMedia(true);
    render(<AppShell />, { wrapper });
    expect(screen.getByText("CESAR v0.1.0")).toBeInTheDocument();
  });

  it("[@display] renders HealthIndicator in footer", () => {
    mockMatchMedia(true);
    render(<AppShell />, { wrapper });
    expect(screen.getByTitle("Verificando servicios...")).toBeInTheDocument();
  });

  it("hides sidebar on mobile by default", () => {
    mockMatchMedia(false);
    render(<AppShell />, { wrapper });
    expect(screen.queryByText("Pagos")).not.toBeInTheDocument();
  });
});
