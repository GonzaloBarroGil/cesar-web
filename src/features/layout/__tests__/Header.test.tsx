import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Header } from "../Header";
import { MockConsorcioProvider } from "./mocks";

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

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Header", () => {
  it("[@display] shows user full name and role", () => {
    mockMatchMedia(true);

    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MockConsorcioProvider>
          <MemoryRouter>
            <Header onMenuToggle={() => {}} />
          </MemoryRouter>
        </MockConsorcioProvider>
      </MockAuthProvider>,
    );

    expect(screen.getByText("Administrador General")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
  });

  it("[@display] shows hamburger menu button on mobile", () => {
    mockMatchMedia(false);

    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MockConsorcioProvider>
          <MemoryRouter>
            <Header onMenuToggle={() => {}} />
          </MemoryRouter>
        </MockConsorcioProvider>
      </MockAuthProvider>,
    );

    expect(screen.getByRole("button", { name: /menú/i })).toBeInTheDocument();
  });

  it("hides hamburger menu button on desktop", () => {
    mockMatchMedia(true);

    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MockConsorcioProvider>
          <MemoryRouter>
            <Header onMenuToggle={() => {}} />
          </MemoryRouter>
        </MockConsorcioProvider>
      </MockAuthProvider>,
    );

    expect(screen.queryByRole("button", { name: /menú/i })).not.toBeInTheDocument();
  });

  it("[@happy-path] logout button navigates to /login", () => {
    mockMatchMedia(true);
    const mockLogout = vi.fn();

    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser, logout: mockLogout }}>
        <MockConsorcioProvider>
          <MemoryRouter>
            <Header onMenuToggle={() => {}} />
          </MemoryRouter>
        </MockConsorcioProvider>
      </MockAuthProvider>,
    );

    fireEvent.click(screen.getByText("Salir"));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });

  it("[@happy-path] shows selected consorcio in dropdown", () => {
    const consorcios = [
      {
        id: "1",
        cuit: "30711111111",
        razon_social: "Consorcio Torre Norte",
      },
    ];

    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MockConsorcioProvider selectedId="1" consorcios={consorcios}>
          <MemoryRouter>
            <Header onMenuToggle={() => {}} />
          </MemoryRouter>
        </MockConsorcioProvider>
      </MockAuthProvider>,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.text);
    expect(options).toContain("Consorcio Torre Norte");
  });

  it("[@empty-state] shows 'Seleccionar consorcio' when no consorcio selected", () => {
    const consorcios = [
      {
        id: "1",
        cuit: "30711111111",
        razon_social: "Consorcio Torre Norte",
      },
    ];

    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MockConsorcioProvider selectedId={null} consorcios={consorcios}>
          <MemoryRouter>
            <Header onMenuToggle={() => {}} />
          </MemoryRouter>
        </MockConsorcioProvider>
      </MockAuthProvider>,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.text);
    expect(options).toContain("Seleccionar consorcio");
  });

  it("[@empty-state] shows 'Sin consorcios' when list is empty", () => {
    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MockConsorcioProvider selectedId={null} consorcios={[]}>
          <MemoryRouter>
            <Header onMenuToggle={() => {}} />
          </MemoryRouter>
        </MockConsorcioProvider>
      </MockAuthProvider>,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.text);
    expect(options).toContain("Sin consorcios");
  });
});
