import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SignButton } from "../SignButton";

vi.mock("@/api/generated/debt/debt", () => ({
  useSignCertificado: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  getGetCertificadoQueryKey: vi.fn((id: string) => ["certificado", id]),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const adminUser = {
  id: "1",
  username: "admin",
  role: "ADMIN" as const,
  consorcio_id: null,
  nombre_completo: "Administrador General",
};

function renderSignButton(status: string) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider authState={{ isAuthenticated: true, user: adminUser }}>
        <SignButton
          certificadoId="550e8400-e29b-41d4-a716-446655441001"
          status={status as "VIGENTE" | "EJECUTADO" | "VENCIDO"}
        />
      </MockAuthProvider>
    </QueryClientProvider>,
  );
}

describe("SignButton", () => {
  it("[@display] shown when status is VIGENTE", () => {
    renderSignButton("VIGENTE");

    expect(screen.getByRole("button", { name: "Firmar" })).toBeInTheDocument();
  });

  it("does NOT show when status is EJECUTADO", () => {
    const { container } = renderSignButton("EJECUTADO");

    expect(container.textContent).toBe("");
    expect(screen.queryByRole("button", { name: "Firmar" })).not.toBeInTheDocument();
  });

  it("does NOT show when status is VENCIDO", () => {
    const { container } = renderSignButton("VENCIDO");

    expect(container.textContent).toBe("");
    expect(screen.queryByRole("button", { name: "Firmar" })).not.toBeInTheDocument();
  });

  it("opens DEC-002 confirmation dialog on click", () => {
    renderSignButton("VIGENTE");

    fireEvent.click(screen.getByRole("button", { name: "Firmar" }));

    expect(screen.getByText("Firmar certificado")).toBeInTheDocument();
    expect(
      screen.getByText(
        "¿Firmar este certificado? Se convertira en titulo ejecutivo y no podra revertirse.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("dialog closes on cancel click", () => {
    renderSignButton("VIGENTE");

    fireEvent.click(screen.getByRole("button", { name: "Firmar" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByText("Firmar certificado")).not.toBeInTheDocument();
  });
});
