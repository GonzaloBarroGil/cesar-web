import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../LoginForm";
import { MockAuthProvider } from "./mocks";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginForm", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders login form with username and password fields", () => {
    const mockLogin = vi.fn();
    render(
      <MockAuthProvider authState={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it("shows error on invalid credentials", async () => {
    const mockLogin = vi
      .fn()
      .mockRejectedValue(new Error("Credenciales inválidas. Verifique usuario y contraseña."));

    render(
      <MockAuthProvider authState={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    fireEvent.change(screen.getByLabelText("Usuario"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  it("redirects after successful login", async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);

    render(
      <MockAuthProvider authState={{ login: mockLogin }}>
        <MemoryRouter initialEntries={["/login"]}>
          <LoginForm />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    fireEvent.change(screen.getByLabelText("Usuario"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin", "admin123");
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("redirects to saved URL after login", async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);

    render(
      <MockAuthProvider authState={{ login: mockLogin }}>
        <MemoryRouter initialEntries={["/login?redirect=/expenses"]}>
          <LoginForm />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    fireEvent.change(screen.getByLabelText("Usuario"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/expenses", { replace: true });
    });
  });

  it("disables button and shows loading state during submission", async () => {
    const mockLogin = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(
      <MockAuthProvider authState={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    fireEvent.change(screen.getByLabelText("Usuario"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(screen.getByRole("button", { name: /iniciando sesión/i })).toBeDisabled();
  });

  it("clears password on error but preserves username", async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error("invalid"));

    render(
      <MockAuthProvider authState={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    fireEvent.change(screen.getByLabelText("Usuario"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Usuario")).toHaveValue("admin");
      expect(screen.getByLabelText("Contraseña")).toHaveValue("");
    });
  });
});
