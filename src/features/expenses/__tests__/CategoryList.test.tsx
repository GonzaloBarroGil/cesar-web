import type { CategoryResponse } from "@/api/generated/models";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryList } from "../CategoryList";

const mockCategories: CategoryResponse[] = [
  { id: "550e8400-e29b-41d4-a716-446655440100", name: "Mantenimiento" },
  { id: "550e8400-e29b-41d4-a716-446655440101", name: "Servicios" },
  { id: "550e8400-e29b-41d4-a716-446655440102", name: "Administracion" },
];

describe("CategoryList", () => {
  it("[@display] renders category names in list", () => {
    render(
      <CategoryList categories={mockCategories} isLoading={false} onCreateCategory={() => {}} />,
    );

    expect(screen.getByRole("heading", { name: "Categorias" })).toBeInTheDocument();
    expect(screen.getByText("Mantenimiento")).toBeInTheDocument();
    expect(screen.getByText("Servicios")).toBeInTheDocument();
    expect(screen.getByText("Administracion")).toBeInTheDocument();
  });

  it("[@display] shows category descriptions when present", () => {
    const withDesc: CategoryResponse[] = [
      {
        id: "550e8400-e29b-41d4-a716-446655440100",
        name: "Mantenimiento",
        default_concept_id: "550e8400-e29b-41d4-a716-446655440200",
      },
      { id: "550e8400-e29b-41d4-a716-446655440101", name: "Servicios" },
    ];

    render(<CategoryList categories={withDesc} isLoading={false} onCreateCategory={() => {}} />);

    expect(screen.getByText("Mantenimiento")).toBeInTheDocument();
    expect(screen.getByText("Servicios")).toBeInTheDocument();
  });

  it("[@empty-state] shows empty message when no categories", () => {
    render(<CategoryList categories={[]} isLoading={false} onCreateCategory={() => {}} />);

    expect(screen.getByText("No hay categorias registradas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear la primera/i })).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading", () => {
    render(<CategoryList categories={[]} isLoading onCreateCategory={() => {}} />);

    expect(screen.queryByText("No hay categorias registradas")).not.toBeInTheDocument();
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows error message when error prop present", () => {
    render(
      <CategoryList
        categories={[]}
        isLoading={false}
        error={new Error("Network error")}
        onCreateCategory={() => {}}
      />,
    );

    expect(screen.getByText("Error al cargar las categorias")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("shows Nueva Categoria button", () => {
    render(
      <CategoryList categories={mockCategories} isLoading={false} onCreateCategory={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "Nueva Categoria" })).toBeInTheDocument();
  });

  it("opens create dialog when clicking Nueva Categoria", () => {
    render(
      <CategoryList categories={mockCategories} isLoading={false} onCreateCategory={() => {}} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Nueva Categoria" }));

    expect(screen.getByText("Crear Categoria")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
  });

  it("calls onCreateCategory when confirming from dialog", () => {
    const onCreateCategory = vi.fn();

    render(
      <CategoryList
        categories={mockCategories}
        isLoading={false}
        onCreateCategory={onCreateCategory}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Nueva Categoria" }));

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Limpieza" },
    });

    const confirmActions = screen.getAllByRole("button", { name: "Crear" });
    const confirmCreate = confirmActions[confirmActions.length - 1];
    fireEvent.click(confirmCreate);

    expect(onCreateCategory).toHaveBeenCalledWith({ name: "Limpieza" });
  });
});
