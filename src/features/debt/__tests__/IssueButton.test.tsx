import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IssueButton } from "../IssueButton";

vi.mock("@/api/generated/debt/debt", () => ({
  useIssueLiquidacion: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  getGetLiquidacionQueryKey: vi.fn((id: string) => ["liquidacion", id]),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function renderIssueButton(status: string) {
  return render(
    <QueryClientProvider client={queryClient}>
      <IssueButton
        liquidacionId="550e8400-e29b-41d4-a716-446655440901"
        status={status as "DRAFT" | "ISSUED"}
      />
    </QueryClientProvider>,
  );
}

describe("IssueButton", () => {
  it("[@display] shown when status is DRAFT", () => {
    renderIssueButton("DRAFT");

    expect(screen.getByRole("button", { name: "Emitir" })).toBeInTheDocument();
  });

  it("does NOT show when status is ISSUED", () => {
    const { container } = renderIssueButton("ISSUED");

    expect(container.textContent).toBe("");
    expect(screen.queryByRole("button", { name: "Emitir" })).not.toBeInTheDocument();
  });

  it("does NOT show when status is SETTLED", () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <IssueButton liquidacionId="550e8400-e29b-41d4-a716-446655440901" status="SETTLED" />
      </QueryClientProvider>,
    );

    expect(container.textContent).toBe("");
  });

  it("does NOT show when status is CANCELLED", () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <IssueButton liquidacionId="550e8400-e29b-41d4-a716-446655440901" status="CANCELLED" />
      </QueryClientProvider>,
    );

    expect(container.textContent).toBe("");
  });

  it("opens DEC-002 confirmation dialog on click", () => {
    renderIssueButton("DRAFT");

    fireEvent.click(screen.getByRole("button", { name: "Emitir" }));

    expect(screen.getByText("Emitir liquidacion")).toBeInTheDocument();
    expect(
      screen.getByText("¿Emitir esta liquidacion? Una vez emitida no podra modificarse."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("does NOT call onCancel closes dialog", () => {
    renderIssueButton("DRAFT");

    fireEvent.click(screen.getByRole("button", { name: "Emitir" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByText("Emitir liquidacion")).not.toBeInTheDocument();
  });
});
