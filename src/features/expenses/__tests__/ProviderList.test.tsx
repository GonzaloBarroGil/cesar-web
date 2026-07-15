import type { ProviderResponse } from "@/api/generated/models";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ProviderList } from "../ProviderList";

const mockProviders: ProviderResponse[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440300",
    cuit: "30666666661",
    name: "ELEVADORES SRL",
    iva_condition: "RI",
    provider_type: "COMPANY",
    contact_email: "info@elevadoressrl.com.ar",
    contact_phone: "1144440101",
    tombstone: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440301",
    cuit: "30555555551",
    name: "PINTURAS DEL PLATA SA",
    iva_condition: "MONOTRIBUTISTA",
    provider_type: "COMPANY",
    contact_email: "facturas@pinturasdelplata.com.ar",
    contact_phone: "1144440202",
    tombstone: false,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
  },
];

describe("ProviderList", () => {
  it("[@display] renders provider data in table with name, CUIT", () => {
    render(
      <MemoryRouter>
        <ProviderList providers={mockProviders} isLoading={false} onTombstone={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByText("ELEVADORES SRL")).toBeInTheDocument();
    expect(screen.getByText("PINTURAS DEL PLATA SA")).toBeInTheDocument();
    expect(screen.getByText("30666666661")).toBeInTheDocument();
    expect(screen.getByText("30555555551")).toBeInTheDocument();
  });

  it("[@display] shows IVA condition in table", () => {
    render(
      <MemoryRouter>
        <ProviderList providers={mockProviders} isLoading={false} onTombstone={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByText("RI")).toBeInTheDocument();
    expect(screen.getByText("MONOTRIBUTISTA")).toBeInTheDocument();
  });

  it("[@display] shows email in table", () => {
    render(
      <MemoryRouter>
        <ProviderList providers={mockProviders} isLoading={false} onTombstone={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByText("info@elevadoressrl.com.ar")).toBeInTheDocument();
  });

  it("[@display] shows edit and annul action buttons per row", () => {
    render(
      <MemoryRouter>
        <ProviderList providers={mockProviders} isLoading={false} onTombstone={() => {}} />
      </MemoryRouter>,
    );

    const editLinks = screen.getAllByRole("link");
    const editProviderLinks = editLinks.filter(
      (link) =>
        link.getAttribute("href") ===
        "/expenses/providers/550e8400-e29b-41d4-a716-446655440300/edit",
    );
    expect(editProviderLinks).toHaveLength(1);
  });

  it("[@display] shows heading Provedores", () => {
    render(
      <MemoryRouter>
        <ProviderList providers={mockProviders} isLoading={false} onTombstone={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Proveedores" })).toBeInTheDocument();
  });

  it("[@display] links to nuevo proveedor page", () => {
    render(
      <MemoryRouter>
        <ProviderList providers={mockProviders} isLoading={false} onTombstone={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /nuevo proveedor/i })).toHaveAttribute(
      "href",
      "/expenses/providers/new",
    );
  });

  it("[@display] shows tombstone provider with styles", () => {
    const withTombstone = [{ ...mockProviders[0], tombstone: true }, mockProviders[1]];

    render(
      <MemoryRouter>
        <ProviderList providers={withTombstone} isLoading={false} onTombstone={() => {}} />
      </MemoryRouter>,
    );

    const name = screen.getByText("ELEVADORES SRL");
    expect(name.classList.contains("line-through")).toBe(true);
    expect(name.closest("tr")?.classList.contains("opacity-50")).toBe(true);
  });

  it("[@empty-state] shows empty message when no providers", () => {
    render(
      <MemoryRouter>
        <ProviderList providers={[]} isLoading={false} onTombstone={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByText("No hay proveedores registrados")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /registrar el primero/i })).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading", () => {
    render(
      <MemoryRouter>
        <ProviderList providers={[]} isLoading onTombstone={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.queryByText("No hay proveedores registrados")).not.toBeInTheDocument();
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows error with retry button when error prop present", () => {
    render(
      <MemoryRouter>
        <ProviderList
          providers={[]}
          isLoading={false}
          error={new Error("Network error")}
          onTombstone={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Error al cargar los proveedores")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
