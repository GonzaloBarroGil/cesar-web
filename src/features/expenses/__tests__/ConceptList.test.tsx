import type { ConceptResponse } from "@/api/generated/models";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConceptList } from "../ConceptList";

const mockConcepts: ConceptResponse[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440200",
    name: "Mantenimiento de ascensores",
    group: "MANTENIMIENTO",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440201",
    name: "Luz",
    group: "SERVICIOS",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440202",
    name: "Gas",
    group: "SERVICIOS",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440203",
    name: "Pintura de fachada",
    group: "MANTENIMIENTO",
  },
];

describe("ConceptList", () => {
  it("[@display] renders concepts grouped by ConceptGroup", () => {
    render(
      <ConceptList
        concepts={mockConcepts}
        isLoading={false}
        selectedGroup=""
        onSelectGroup={() => {}}
        onCreateConcept={() => {}}
      />,
    );

    expect(screen.getByRole("heading", { name: "Conceptos" })).toBeInTheDocument();
    expect(screen.getAllByText("Servicios").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Mantenimiento").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Luz")).toBeInTheDocument();
    expect(screen.getByText("Gas")).toBeInTheDocument();
    expect(screen.getByText("Mantenimiento de ascensores")).toBeInTheDocument();
    expect(screen.getByText("Pintura de fachada")).toBeInTheDocument();
  });

  it("[@display] shows group filter tabs", () => {
    render(
      <ConceptList
        concepts={mockConcepts}
        isLoading={false}
        selectedGroup=""
        onSelectGroup={() => {}}
        onCreateConcept={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Todos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Servicios" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mantenimiento" })).toBeInTheDocument();
  });

  it("filters concepts when group is selected", () => {
    render(
      <ConceptList
        concepts={mockConcepts}
        isLoading={false}
        selectedGroup="SERVICIOS"
        onSelectGroup={() => {}}
        onCreateConcept={() => {}}
      />,
    );

    expect(screen.getByText("Luz")).toBeInTheDocument();
    expect(screen.getByText("Gas")).toBeInTheDocument();
    expect(screen.queryByText("Mantenimiento de ascensores")).not.toBeInTheDocument();
  });

  it("calls onSelectGroup when group tab clicked", () => {
    const onSelectGroup = vi.fn();

    render(
      <ConceptList
        concepts={mockConcepts}
        isLoading={false}
        selectedGroup=""
        onSelectGroup={onSelectGroup}
        onCreateConcept={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mantenimiento" }));
    expect(onSelectGroup).toHaveBeenCalledWith("MANTENIMIENTO");
  });

  it("[@empty-state] shows empty message per group", () => {
    render(
      <ConceptList
        concepts={[]}
        isLoading={false}
        selectedGroup=""
        onSelectGroup={() => {}}
        onCreateConcept={() => {}}
      />,
    );

    expect(screen.getByText("No hay conceptos registrados")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear el primero/i })).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading", () => {
    render(
      <ConceptList
        concepts={[]}
        isLoading
        selectedGroup=""
        onSelectGroup={() => {}}
        onCreateConcept={() => {}}
      />,
    );

    expect(screen.queryByText("No hay conceptos registrados")).not.toBeInTheDocument();
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows error with retry button when error prop present", () => {
    render(
      <ConceptList
        concepts={[]}
        isLoading={false}
        error={new Error("Network error")}
        selectedGroup=""
        onSelectGroup={() => {}}
        onCreateConcept={() => {}}
      />,
    );

    expect(screen.getByText("Error al cargar los conceptos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("shows Nuevo Concepto button", () => {
    render(
      <ConceptList
        concepts={mockConcepts}
        isLoading={false}
        selectedGroup=""
        onSelectGroup={() => {}}
        onCreateConcept={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Nuevo Concepto" })).toBeInTheDocument();
  });

  it("opens create dialog when clicking Nuevo Concepto", () => {
    render(
      <ConceptList
        concepts={mockConcepts}
        isLoading={false}
        selectedGroup=""
        onSelectGroup={() => {}}
        onCreateConcept={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Nuevo Concepto" }));

    expect(screen.getByText("Crear Concepto")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
  });

  it("calls onCreateConcept when creating from dialog", () => {
    const onCreateConcept = vi.fn();

    render(
      <ConceptList
        concepts={mockConcepts}
        isLoading={false}
        selectedGroup="SERVICIOS"
        onSelectGroup={() => {}}
        onCreateConcept={onCreateConcept}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Nuevo Concepto" }));

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Nuevo concepto" },
    });

    const confirmActions = screen.getAllByRole("button", { name: "Crear" });
    const confirmCreate = confirmActions[confirmActions.length - 1];
    fireEvent.click(confirmCreate);

    expect(onCreateConcept).toHaveBeenCalledWith({
      name: "Nuevo concepto",
      group: "SERVICIOS",
    });
  });

  it("selected group tab has highlighted styles", () => {
    render(
      <ConceptList
        concepts={mockConcepts}
        isLoading={false}
        selectedGroup="SERVICIOS"
        onSelectGroup={() => {}}
        onCreateConcept={() => {}}
      />,
    );

    const selectedTab = screen.getByRole("button", { name: "Servicios" });
    expect(selectedTab.className).toContain("bg-neutral-900");
  });
});
