import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "../Sidebar";

const adminUser = {
  id: "1",
  username: "admin",
  role: "ADMIN" as const,
  consorcio_id: null,
  nombre_completo: "Administrador General",
};

const accountantUser = {
  id: "2",
  username: "contador",
  role: "ACCOUNTANT" as const,
  consorcio_id: null,
  nombre_completo: "Contador",
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

describe("Sidebar", () => {
  it("[@role-guard] renders all 7 links for ADMIN user", () => {
    mockMatchMedia(true);

    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter>
          <Sidebar open onClose={() => {}} />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Consorcios")).toBeInTheDocument();
    expect(screen.getByText("Expensas")).toBeInTheDocument();
    expect(screen.getByText("Facturación")).toBeInTheDocument();
    expect(screen.getByText("Deuda")).toBeInTheDocument();
    expect(screen.getByText("Pagos")).toBeInTheDocument();
    expect(screen.getByText("Ing./Egr.")).toBeInTheDocument();
  });

  it("[@role-guard] renders only Facturación for ACCOUNTANT", () => {
    mockMatchMedia(true);

    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: accountantUser }}>
        <MemoryRouter>
          <Sidebar open onClose={() => {}} />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(screen.getByText("Facturación")).toBeInTheDocument();
    expect(screen.queryByText("Inicio")).not.toBeInTheDocument();
    expect(screen.queryByText("Consorcios")).not.toBeInTheDocument();
    expect(screen.queryByText("Expensas")).not.toBeInTheDocument();
    expect(screen.queryByText("Deuda")).not.toBeInTheDocument();
    expect(screen.queryByText("Pagos")).not.toBeInTheDocument();
    expect(screen.queryByText("Ing./Egr.")).not.toBeInTheDocument();
  });

  it("renders brand text CESAR", () => {
    mockMatchMedia(true);

    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter>
          <Sidebar open onClose={() => {}} />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(screen.getByText("CESAR")).toBeInTheDocument();
  });

  it("returns null on mobile when closed", () => {
    mockMatchMedia(false);

    const { container } = render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter>
          <Sidebar open={false} onClose={() => {}} />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(container.innerHTML).toBe("");
  });

  it("[@display] shows backdrop overlay on mobile when open", () => {
    mockMatchMedia(false);

    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter>
          <Sidebar open onClose={() => {}} />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(document.querySelector(".bg-black\\/50")).toBeInTheDocument();
  });

  it("calls onClose when clicking the mobile backdrop", () => {
    mockMatchMedia(false);
    const onClose = vi.fn();

    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter>
          <Sidebar open onClose={onClose} />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    const overlay = document.querySelector(".bg-black\\/50");
    if (!overlay) throw new Error("Overlay not found");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when pressing Escape on backdrop", () => {
    mockMatchMedia(false);
    const onClose = vi.fn();

    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter>
          <Sidebar open onClose={onClose} />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    const overlay = document.querySelector(".bg-black\\/50");
    if (!overlay) throw new Error("Overlay not found");
    fireEvent.keyDown(overlay, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
