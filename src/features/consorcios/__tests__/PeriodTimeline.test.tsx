import type { PeriodData } from "@/mocks/fixtures/data";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PeriodTimeline } from "../PeriodTimeline";

const samplePeriods: PeriodData[] = [
  {
    id: "p1",
    consorcio_id: "c1",
    code: "202606",
    start_date: "2026-06-01",
    end_date: "2026-06-30",
    status: "OPEN",
    created_at: "2026-06-01T00:00:00Z",
    closed_at: null,
    archived_at: null,
  },
  {
    id: "p2",
    consorcio_id: "c1",
    code: "202605",
    start_date: "2026-05-01",
    end_date: "2026-05-31",
    status: "CLOSED",
    created_at: "2026-05-01T00:00:00Z",
    closed_at: "2026-05-31T00:00:00Z",
    archived_at: null,
  },
  {
    id: "p3",
    consorcio_id: "c1",
    code: "202604",
    start_date: "2026-04-01",
    end_date: "2026-04-30",
    status: "ARCHIVED",
    created_at: "2026-04-01T00:00:00Z",
    closed_at: "2026-04-15T00:00:00Z",
    archived_at: "2026-04-30T00:00:00Z",
  },
];

describe("PeriodTimeline", () => {
  it("[@display] renders all periods with correct status labels", () => {
    render(
      <PeriodTimeline
        periods={samplePeriods}
        onOpen={() => {}}
        onClose={() => {}}
        onArchive={() => {}}
        isMutating={false}
      />,
    );

    expect(screen.getByText("202606")).toBeInTheDocument();
    expect(screen.getByText("202605")).toBeInTheDocument();
    expect(screen.getByText("202604")).toBeInTheDocument();
    expect(screen.getByText("Abierto")).toBeInTheDocument();
    expect(screen.getByText("Cerrado")).toBeInTheDocument();
    expect(screen.getByText("Archivado")).toBeInTheDocument();
  });

  it("[@display] shows Cerrar button only for OPEN period", () => {
    render(
      <PeriodTimeline
        periods={samplePeriods}
        onOpen={() => {}}
        onClose={() => {}}
        onArchive={() => {}}
        isMutating={false}
      />,
    );

    const cerrarButtons = screen.getAllByRole("button", { name: /cerrar/i });
    expect(cerrarButtons).toHaveLength(1);
  });

  it("[@display] shows Archivar button only for CLOSED period", () => {
    render(
      <PeriodTimeline
        periods={samplePeriods}
        onOpen={() => {}}
        onClose={() => {}}
        onArchive={() => {}}
        isMutating={false}
      />,
    );

    const archivarButtons = screen.getAllByRole("button", { name: /archivar/i });
    expect(archivarButtons).toHaveLength(1);
  });

  it("[@display] shows no action button for ARCHIVED period", () => {
    render(
      <PeriodTimeline
        periods={samplePeriods}
        onOpen={() => {}}
        onClose={() => {}}
        onArchive={() => {}}
        isMutating={false}
      />,
    );

    const allActionButtons = screen.getAllByRole("button", { name: /cerrar|archivar/i });
    expect(allActionButtons).toHaveLength(2);
  });

  it("[@empty-state] shows empty message when no periods", () => {
    render(
      <PeriodTimeline
        periods={[]}
        onOpen={() => {}}
        onClose={() => {}}
        onArchive={() => {}}
        isMutating={false}
      />,
    );

    expect(screen.getByText(/abra el primer período fiscal/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /abrir período/i })).toHaveLength(2);
  });

  it("opens the inline form when clicking Abrir Período", () => {
    render(
      <PeriodTimeline
        periods={samplePeriods}
        onOpen={() => {}}
        onClose={() => {}}
        onArchive={() => {}}
        isMutating={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /abrir período/i }));
    expect(screen.getByLabelText(/código/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de inicio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de fin/i)).toBeInTheDocument();
  });

  it("calls onClose when confirming close action", () => {
    const onClose = vi.fn();

    render(
      <PeriodTimeline
        periods={samplePeriods}
        onOpen={() => {}}
        onClose={onClose}
        onArchive={() => {}}
        isMutating={false}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /cerrar/i })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /confirmar/i })[0]);

    expect(onClose).toHaveBeenCalledWith("p1");
  });
});
