import type { ConsorcioData } from "@/mocks/fixtures/data";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ConsorcioList } from "../ConsorcioList";

const sampleConsorcios: ConsorcioData[] = [
  {
    id: "1",
    cuit: "30711111111",
    razon_social: "Consorcio Torre Norte",
    nombre_fantasia: "Torre Norte",
    matricula_caba: "MAT-2024-001234",
    domicilio: "Av. Corrientes 4500",
    iva_condition: "RI",
    status: "ACTIVE",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    cuit: "30711111112",
    razon_social: "Consorcio Torre Sur",
    nombre_fantasia: "Torre Sur",
    matricula_caba: "MAT-2024-001235",
    domicilio: "Av. Rivadavia 8500",
    iva_condition: "MONOTRIBUTISTA",
    status: "INACTIVE",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
];

describe("ConsorcioList", () => {
  it("[@display] renders consorcio names and CUITs in table", () => {
    render(
      <MemoryRouter>
        <ConsorcioList consorcios={sampleConsorcios} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Torre Norte")).toBeInTheDocument();
    expect(screen.getByText("Torre Sur")).toBeInTheDocument();
    expect(screen.getByText("30711111111")).toBeInTheDocument();
    expect(screen.getByText("30711111112")).toBeInTheDocument();
  });

  it("[@display] shows active/inactive status badges", () => {
    render(
      <MemoryRouter>
        <ConsorcioList consorcios={sampleConsorcios} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });

  it("[@empty-state] shows empty message when no consorcios", () => {
    render(
      <MemoryRouter>
        <ConsorcioList consorcios={[]} isLoading={false} isError={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/no hay consorcios registrados/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /registrar el primero/i })).toBeInTheDocument();
  });

  it("shows error message with retry button", () => {
    render(
      <MemoryRouter>
        <ConsorcioList consorcios={[]} isLoading={false} isError onRetry={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/no se pudieron cargar los consorcios/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });

  it("shows loading skeleton when loading", () => {
    render(
      <MemoryRouter>
        <ConsorcioList consorcios={[]} isLoading />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/no hay consorcios/i)).not.toBeInTheDocument();
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows Nuevo Consorcio button", () => {
    render(
      <MemoryRouter>
        <ConsorcioList consorcios={sampleConsorcios} isLoading={false} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /nuevo consorcio/i })).toBeInTheDocument();
  });

  it("links to detail page for each consorcio", () => {
    render(
      <MemoryRouter>
        <ConsorcioList consorcios={sampleConsorcios} isLoading={false} />
      </MemoryRouter>,
    );

    const detailLink = screen.getByRole("link", { name: "Torre Norte" });
    expect(detailLink).toHaveAttribute("href", "/consorcios/1");
  });
});
