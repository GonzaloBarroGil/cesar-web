import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/generated/expenses/expenses", () => ({
  useListConcepts: vi.fn(),
  useCreateConcept: vi.fn(),
}));

import { useCreateConcept, useListConcepts } from "@/api/generated/expenses/expenses";
import { ConceptListPage } from "../ConceptListPage";

const mockConcept = {
  id: "c1",
  name: "Luz",
  group: "SERVICIOS",
  tombstone: false,
  created_at: "2026-01-01T00:00:00Z",
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ConceptListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ConceptListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateConcept).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useCreateConcept>>);
  });

  it("[@display] renders back link and ConceptList", () => {
    vi.mocked(useListConcepts).mockReturnValue({
      data: [mockConcept],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListConcepts>>);
    renderPage();

    expect(screen.getByText("Expensas")).toBeInTheDocument();
    expect(screen.getByText("Conceptos")).toBeInTheDocument();
  });

  it("[@display] renders concept data", () => {
    vi.mocked(useListConcepts).mockReturnValue({
      data: [mockConcept],
      isLoading: false,
      error: null,
    } as Partial<ReturnType<typeof useListConcepts>>);
    renderPage();

    expect(screen.getByText("Luz")).toBeInTheDocument();
    const serviciosElements = screen.getAllByText("Servicios");
    expect(serviciosElements.length).toBeGreaterThanOrEqual(1);
  });

  it("[@loading] shows loading skeleton", () => {
    vi.mocked(useListConcepts).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as Partial<ReturnType<typeof useListConcepts>>);
    renderPage();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("[@error-state] shows error message", () => {
    vi.mocked(useListConcepts).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("test error"),
    } as Partial<ReturnType<typeof useListConcepts>>);
    renderPage();

    expect(screen.getByText("Error al cargar los conceptos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });
});
