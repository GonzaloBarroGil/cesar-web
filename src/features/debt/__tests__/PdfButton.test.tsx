import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PdfButton } from "../PdfButton";

vi.mock("@/api/generated/debt/debt", () => ({
  useDownloadLiquidacionPdf: vi.fn(() => ({
    refetch: vi.fn(),
  })),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function renderPdfButton(status: string) {
  return render(
    <QueryClientProvider client={queryClient}>
      <PdfButton
        liquidacionId="550e8400-e29b-41d4-a716-446655440901"
        status={status as "DRAFT" | "ISSUED"}
      />
    </QueryClientProvider>,
  );
}

describe("PdfButton", () => {
  it("[@display] disabled when status is DRAFT with tooltip", () => {
    renderPdfButton("DRAFT");

    const button = screen.getByRole("button", { name: "Descargar PDF" });
    expect(button).toBeDisabled();
    expect(button.closest("span")).toHaveAttribute("title", "Emita la liquidacion primero");
  });

  it("[@display] enabled when status is ISSUED", () => {
    renderPdfButton("ISSUED");

    const button = screen.getByRole("button", { name: "Descargar PDF" });
    expect(button).not.toBeDisabled();
    expect(button.closest("span")).toHaveAttribute("title", "Descargar PDF");
  });

  it("[@display] shows correct tooltip text for DRAFT state", () => {
    renderPdfButton("DRAFT");

    const span = screen.getByRole("button", { name: "Descargar PDF" }).closest("span");
    expect(span).toHaveAttribute("title", "Emita la liquidacion primero");
  });

  it("[@display] shows correct tooltip text for ISSUED state", () => {
    renderPdfButton("ISSUED");

    const span = screen.getByRole("button", { name: "Descargar PDF" }).closest("span");
    expect(span).toHaveAttribute("title", "Descargar PDF");
  });
});
