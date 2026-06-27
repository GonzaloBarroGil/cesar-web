import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "../Breadcrumbs";

describe("Breadcrumbs", () => {
  it("renders null on home route", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Breadcrumbs />
      </MemoryRouter>,
    );

    expect(container.innerHTML).toBe("");
  });

  it("[@display] shows correct breadcrumbs for known route", () => {
    render(
      <MemoryRouter initialEntries={["/expenses"]}>
        <Breadcrumbs />
      </MemoryRouter>,
    );

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Expensas")).toBeInTheDocument();
  });

  it("[@display] shows breadcrumbs for nested resource route", () => {
    render(
      <MemoryRouter initialEntries={["/expenses/new"]}>
        <Breadcrumbs />
      </MemoryRouter>,
    );

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Expensas")).toBeInTheDocument();
    expect(screen.getByText("Nuevo")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(
      <MemoryRouter initialEntries={["/consorcios"]}>
        <Breadcrumbs />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Migas de pan")).toBeInTheDocument();
  });

  it("renders links for parent segments", () => {
    render(
      <MemoryRouter initialEntries={["/invoices/new"]}>
        <Breadcrumbs />
      </MemoryRouter>,
    );

    const inicioLink = screen.getByRole("link", { name: "Inicio" });
    expect(inicioLink).toHaveAttribute("href", "/");

    const invoicesLink = screen.getByRole("link", { name: "Facturación" });
    expect(invoicesLink).toHaveAttribute("href", "/invoices");
  });

  it("renders last segment as plain text (not link)", () => {
    render(
      <MemoryRouter initialEntries={["/expenses/new"]}>
        <Breadcrumbs />
      </MemoryRouter>,
    );

    expect(screen.getByText("Nuevo")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Nuevo" })).not.toBeInTheDocument();
  });
});
