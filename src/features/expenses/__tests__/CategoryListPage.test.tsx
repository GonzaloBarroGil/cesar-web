import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/expenses/expenses", () => ({
  useListCategories: vi.fn(),
  useCreateCategory: vi.fn(),
}));

import { useCreateCategory, useListCategories } from "@/api/generated/expenses/expenses";
import { CategoryListPage } from "../CategoryListPage";

const mockCategory = {
  id: "cat1",
  name: "Servicios Basicos",
  tombstone: false,
  created_at: "2026-01-01T00:00:00Z",
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CategoryListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CategoryListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateCategory).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useCreateCategory>>);
  });

  it("[@display] renders back link and CategoryList", () => {
    vi.mocked(useListCategories).mockReturnValue({
      data: [mockCategory],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListCategories>>);
    renderPage();

    expect(screen.getByText("Expensas")).toBeInTheDocument();
    expect(screen.getByText("Categorias")).toBeInTheDocument();
  });

  it("[@display] renders category data", () => {
    vi.mocked(useListCategories).mockReturnValue({
      data: [mockCategory],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListCategories>>);
    renderPage();

    expect(screen.getByText("Servicios Basicos")).toBeInTheDocument();
  });

  it("[@loading] shows loading skeleton", () => {
    vi.mocked(useListCategories).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as Partial<ReturnType<typeof useListCategories>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] shows error message", () => {
    vi.mocked(useListCategories).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("test error"),
    } as Partial<ReturnType<typeof useListCategories>>);
    renderPage();

    expect(screen.getByText("Error al cargar las categorias")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
