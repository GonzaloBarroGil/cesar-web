import type { ExpenseResponse } from "@/api/generated/models";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExpenseActions } from "../ExpenseActions";

const extraPending: ExpenseResponse = {
  id: "550e8400-e29b-41d4-a716-446655440705",
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  period_code: "202606",
  category_id: "550e8400-e29b-41d4-a716-446655440100",
  concept_id: "550e8400-e29b-41d4-a716-446655440200",
  item: "Reparacion de cubierta terraza",
  term: 1,
  total_terms: 2,
  provider_id: "550e8400-e29b-41d4-a716-446655440300",
  cost: { amount: "350000.00", currency: "ARS" },
  expense_type: "EXTRAORDINARIA",
  approval_status: "PENDING",
  hash: "a".repeat(64),
  version: 0,
  created_at: "2026-06-15T10:00:00Z",
  created_by: "550e8400-e29b-41d4-a716-446655440999",
  tombstone: false,
};

const ordinariaApproved: ExpenseResponse = {
  id: "550e8400-e29b-41d4-a716-446655440701",
  consorcio_id: "550e8400-e29b-41d4-a716-446655440001",
  period_code: "202606",
  category_id: "550e8400-e29b-41d4-a716-446655440100",
  concept_id: "550e8400-e29b-41d4-a716-446655440200",
  item: "Mantenimiento ascensores",
  term: 1,
  total_terms: 1,
  provider_id: "550e8400-e29b-41d4-a716-446655440300",
  cost: { amount: "45000.00", currency: "ARS" },
  expense_type: "ORDINARIA",
  approval_status: "APPROVED",
  hash: "b".repeat(64),
  version: 0,
  created_at: "2026-06-15T10:00:00Z",
  created_by: "550e8400-e29b-41d4-a716-446655440999",
  tombstone: false,
};

describe("ExpenseActions", () => {
  it("shows approve button for EXTRAORDINARIA + PENDING", () => {
    render(
      <ExpenseActions
        expense={extraPending}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Aprobar" })).toBeInTheDocument();
  });

  it("shows reject button for EXTRAORDINARIA + PENDING", () => {
    render(
      <ExpenseActions
        expense={extraPending}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Rechazar" })).toBeInTheDocument();
  });

  it("does NOT show approve button for ORDINARIA", () => {
    render(
      <ExpenseActions
        expense={ordinariaApproved}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
      />,
    );

    expect(screen.queryByRole("button", { name: "Aprobar" })).not.toBeInTheDocument();
  });

  it("does NOT show reject button for ORDINARIA", () => {
    render(
      <ExpenseActions
        expense={ordinariaApproved}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
      />,
    );

    expect(screen.queryByRole("button", { name: "Rechazar" })).not.toBeInTheDocument();
  });

  it("does NOT show approve button for EXTRAORDINARIA + APPROVED", () => {
    const approved = {
      ...extraPending,
      approval_status: "APPROVED" as const,
    };
    render(
      <ExpenseActions
        expense={approved}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
      />,
    );

    expect(screen.queryByRole("button", { name: "Aprobar" })).not.toBeInTheDocument();
  });

  it("does NOT show approve button for EXTRAORDINARIA + REJECTED", () => {
    const rejected = {
      ...extraPending,
      approval_status: "REJECTED" as const,
    };
    render(
      <ExpenseActions
        expense={rejected}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
      />,
    );

    expect(screen.queryByRole("button", { name: "Aprobar" })).not.toBeInTheDocument();
  });

  it("shows tombstone button for active expenses", () => {
    render(
      <ExpenseActions
        expense={ordinariaApproved}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Eliminar" })).toBeInTheDocument();
  });

  it("does NOT render anything for tombstoned expenses", () => {
    const tombstoned = { ...ordinariaApproved, tombstone: true };
    const { container } = render(
      <ExpenseActions
        expense={tombstoned}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
      />,
    );

    expect(container.textContent).toBe("");
  });

  it("calls onApprove when approve button clicked", () => {
    const onApprove = vi.fn();

    render(
      <ExpenseActions
        expense={extraPending}
        onApprove={onApprove}
        onReject={() => {}}
        onTombstone={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));
    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it("reject button opens confirmation dialog", () => {
    render(
      <ExpenseActions
        expense={extraPending}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

    expect(screen.getByText("Rechazar gasto")).toBeInTheDocument();
    expect(
      screen.getByText("Esta seguro de rechazar este gasto extraordinario?"),
    ).toBeInTheDocument();
  });

  it("calls onReject when reject confirmed in dialog", () => {
    const onReject = vi.fn();

    render(
      <ExpenseActions
        expense={extraPending}
        onApprove={() => {}}
        onReject={onReject}
        onTombstone={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

    const confirmActions = screen.getAllByRole("button", { name: "Rechazar" });
    const confirmReject = confirmActions[confirmActions.length - 1];

    fireEvent.click(confirmReject);
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it("tombstone button opens confirmation dialog", () => {
    render(
      <ExpenseActions
        expense={ordinariaApproved}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(screen.getByText("Eliminar gasto")).toBeInTheDocument();
    expect(
      screen.getByText("No se borrara permanentemente. Quedara marcado como anulado."),
    ).toBeInTheDocument();
  });

  it("calls onTombstone when tombstone confirmed in dialog", () => {
    const onTombstone = vi.fn();

    render(
      <ExpenseActions
        expense={ordinariaApproved}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={onTombstone}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    const confirmActions = screen.getAllByRole("button", { name: "Eliminar" });
    const confirmDelete = confirmActions[confirmActions.length - 1];

    fireEvent.click(confirmDelete);
    expect(onTombstone).toHaveBeenCalledTimes(1);
  });

  it("disables approve button when isApproving", () => {
    render(
      <ExpenseActions
        expense={extraPending}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
        isApproving
      />,
    );

    expect(screen.getByRole("button", { name: "Aprobando..." })).toBeDisabled();
  });

  it("disables reject button when isRejecting", () => {
    render(
      <ExpenseActions
        expense={extraPending}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
        isRejecting
      />,
    );

    expect(screen.getByRole("button", { name: "Rechazando..." })).toBeDisabled();
  });

  it("disables tombstone button when isTombstoning", () => {
    render(
      <ExpenseActions
        expense={ordinariaApproved}
        onApprove={() => {}}
        onReject={() => {}}
        onTombstone={() => {}}
        isTombstoning
      />,
    );

    expect(screen.getByRole("button", { name: "Eliminando..." })).toBeDisabled();
  });
});
