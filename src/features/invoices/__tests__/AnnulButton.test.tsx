import { MockAuthProvider } from "@/features/auth/__tests__/mocks";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AnnulButton } from "../AnnulButton";

const adminUser = {
  id: "1",
  username: "admin",
  role: "ADMIN" as const,
  consorcio_id: null,
  nombre_completo: "Administrador General",
};

const accountantUser = {
  id: "2",
  username: "contador",
  role: "ACCOUNTANT" as const,
  consorcio_id: null,
  nombre_completo: "Contador",
};

function renderAsRole(
  user: typeof adminUser | typeof accountantUser,
  props: Partial<ComponentProps<typeof AnnulButton>> = {},
) {
  return render(
    <MockAuthProvider authState={{ isAuthenticated: true, user }}>
      <MemoryRouter>
        <AnnulButton onAnnul={() => {}} isSubmitting={false} {...props} />
      </MemoryRouter>
    </MockAuthProvider>,
  );
}

describe("AnnulButton", () => {
  it("[@display] renders button when user is ADMIN", () => {
    renderAsRole(adminUser);

    expect(screen.getByRole("button", { name: "Anular" })).toBeInTheDocument();
  });

  it("[@role-guard] does NOT render when user is ACCOUNTANT", () => {
    const { container } = renderAsRole(accountantUser);

    expect(container.textContent).toBe("");
    expect(screen.queryByRole("button", { name: "Anular" })).not.toBeInTheDocument();
  });

  it("opens DEC-002 confirmation dialog on click", () => {
    renderAsRole(adminUser);

    fireEvent.click(screen.getByRole("button", { name: "Anular" }));

    expect(screen.getByText("Anular documento")).toBeInTheDocument();
    expect(
      screen.getByText("La factura quedara marcada como ANULADA y no podra reactivarse."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("shows custom description in the dialog", () => {
    renderAsRole(adminUser, { description: "¿Anular este recibo?" });

    fireEvent.click(screen.getByRole("button", { name: "Anular" }));

    expect(screen.getByText("¿Anular este recibo?")).toBeInTheDocument();
  });

  it("calls onAnnul when confirmed", () => {
    const onAnnul = vi.fn();
    renderAsRole(adminUser, { onAnnul });

    fireEvent.click(screen.getByRole("button", { name: "Anular" }));

    const annulButtons = screen.getAllByRole("button", { name: "Anular" });
    const confirmAnnul = annulButtons[annulButtons.length - 1];

    fireEvent.click(confirmAnnul);
    expect(onAnnul).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onAnnul when cancelled", () => {
    const onAnnul = vi.fn();
    renderAsRole(adminUser, { onAnnul });

    fireEvent.click(screen.getByRole("button", { name: "Anular" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onAnnul).not.toHaveBeenCalled();
  });

  it("is disabled when isSubmitting", () => {
    renderAsRole(adminUser, { isSubmitting: true });

    expect(screen.getByRole("button", { name: "Anulando..." })).toBeDisabled();
  });
});
