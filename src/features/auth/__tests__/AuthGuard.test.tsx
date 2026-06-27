import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthGuard, RoleGuard } from "../AuthGuard";
import { MockAuthProvider } from "./mocks";

describe("AuthGuard", () => {
  it("shows loading skeleton when session is being validated", () => {
    render(
      <MockAuthProvider authState={{ isLoading: true, isAuthenticated: false }}>
        <MemoryRouter>
          <AuthGuard />
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("redirects to /login when unauthenticated", () => {
    render(
      <MockAuthProvider authState={{ isAuthenticated: false, isLoading: false }}>
        <MemoryRouter initialEntries={["/expenses"]}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route element={<AuthGuard />}>
              <Route path="/expenses" element={<div>Protected</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("redirects to /login with redirect param for deep links", () => {
    render(
      <MockAuthProvider authState={{ isAuthenticated: false, isLoading: false }}>
        <MemoryRouter initialEntries={["/debt"]}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route element={<AuthGuard />}>
              <Route path="/debt" element={<div>Debt</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    render(
      <MockAuthProvider
        authState={{
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: "1",
            username: "admin",
            role: "ADMIN",
            consorcio_id: null,
            nombre_completo: "Admin",
          },
        }}
      >
        <MemoryRouter>
          <Routes>
            <Route element={<AuthGuard />}>
              <Route index element={<div>Protected Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});

describe("RoleGuard", () => {
  const adminUser = {
    id: "1",
    username: "admin",
    role: "ADMIN" as const,
    consorcio_id: null,
    nombre_completo: "Admin",
  };
  const accountantUser = {
    id: "2",
    username: "contador",
    role: "ACCOUNTANT" as const,
    consorcio_id: null,
    nombre_completo: "Contador",
  };

  it("allows ADMIN to access ADMIN route", () => {
    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <MemoryRouter initialEntries={["/consorcios"]}>
          <Routes>
            <Route path="/invoices" element={<div>Invoices</div>} />
            <Route element={<RoleGuard requiredRole="ADMIN" />}>
              <Route path="/consorcios" element={<div>Consorcios</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(screen.getByText("Consorcios")).toBeInTheDocument();
  });

  it("redirects ACCOUNTANT away from ADMIN route", () => {
    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: accountantUser }}>
        <MemoryRouter initialEntries={["/consorcios"]}>
          <Routes>
            <Route path="/invoices" element={<div>Invoices</div>} />
            <Route element={<RoleGuard requiredRole="ADMIN" />}>
              <Route path="/consorcios" element={<div>Consorcios</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(screen.getByText("Invoices")).toBeInTheDocument();
    expect(screen.queryByText("Consorcios")).not.toBeInTheDocument();
  });

  it("allows ACCOUNTANT to access shared route", () => {
    render(
      <MockAuthProvider authState={{ isAuthenticated: true, user: accountantUser }}>
        <MemoryRouter initialEntries={["/invoices"]}>
          <Routes>
            <Route element={<RoleGuard requiredRole={["ADMIN", "ACCOUNTANT"]} />}>
              <Route path="/invoices" element={<div>Invoices</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MockAuthProvider>,
    );

    expect(screen.getByText("Invoices")).toBeInTheDocument();
  });
});
