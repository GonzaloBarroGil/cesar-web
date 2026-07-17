import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GenerateModal } from "../GenerateModal";

describe("GenerateModal", () => {
  it("renders nothing when closed", () => {
    render(
      <GenerateModal
        open={false}
        onOpenChange={() => {}}
        onGenerate={async () => {}}
        onBatchGenerate={async () => {}}
      />,
    );

    expect(screen.queryByText("Generar Liquidacion")).not.toBeInTheDocument();
  });

  it("[@display] renders single/batch tabs when open", () => {
    render(
      <GenerateModal
        open
        onOpenChange={() => {}}
        onGenerate={async () => {}}
        onBatchGenerate={async () => {}}
      />,
    );

    expect(screen.getByText("Unidad individual")).toBeInTheDocument();
    expect(screen.getByText("Todas las UF")).toBeInTheDocument();
  });

  it("[@display] renders period_code and unit_id inputs in single mode", () => {
    render(
      <GenerateModal
        open
        onOpenChange={() => {}}
        onGenerate={async () => {}}
        onBatchGenerate={async () => {}}
      />,
    );

    expect(screen.getByLabelText("Periodo (YYYYMM)")).toBeInTheDocument();
    expect(screen.getByLabelText("ID Unidad Funcional")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generar" })).toBeInTheDocument();
  });

  it("[@validation] shows error when single submit with empty fields", async () => {
    render(
      <GenerateModal
        open
        onOpenChange={() => {}}
        onGenerate={async () => {}}
        onBatchGenerate={async () => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Generar" }));

    expect(
      await screen.findByText("El periodo y la unidad funcional son requeridos."),
    ).toBeInTheDocument();
  });

  it("calls onGenerate when single button clicked with valid data", async () => {
    const onGenerate = vi.fn().mockResolvedValue(undefined);

    render(
      <GenerateModal
        open
        onOpenChange={() => {}}
        onGenerate={onGenerate}
        onBatchGenerate={async () => {}}
      />,
    );

    fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), {
      target: { value: "202606" },
    });
    fireEvent.change(screen.getByLabelText("ID Unidad Funcional"), {
      target: { value: "UF-1A" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Generar" }));

    await vi.waitFor(() => {
      expect(onGenerate).toHaveBeenCalledWith({
        period_code: "202606",
        unit_id: "UF-1A",
      });
    });
  });

  it("[@display] shows batch mode info when switching to batch tab", () => {
    render(
      <GenerateModal
        open
        onOpenChange={() => {}}
        onGenerate={async () => {}}
        onBatchGenerate={async () => {}}
      />,
    );

    fireEvent.click(screen.getByText("Todas las UF"));

    expect(
      screen.getByText(
        "Se generaran liquidaciones para todas las unidades funcionales activas del consorcio.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generar para todas las UF" })).toBeInTheDocument();
  });

  it("shows batch validation error when period empty", async () => {
    render(
      <GenerateModal
        open
        onOpenChange={() => {}}
        onGenerate={async () => {}}
        onBatchGenerate={async () => {}}
      />,
    );

    fireEvent.click(screen.getByText("Todas las UF"));
    fireEvent.click(screen.getByRole("button", { name: "Generar para todas las UF" }));

    expect(await screen.findByText("El periodo es requerido.")).toBeInTheDocument();
  });

  it("calls onBatchGenerate when confirmed in dialog", async () => {
    const onBatchGenerate = vi.fn().mockResolvedValue(undefined);

    render(
      <GenerateModal
        open
        onOpenChange={() => {}}
        onGenerate={async () => {}}
        onBatchGenerate={onBatchGenerate}
      />,
    );

    fireEvent.click(screen.getByText("Todas las UF"));
    fireEvent.change(screen.getByLabelText("Periodo (YYYYMM)"), {
      target: { value: "202607" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Generar para todas las UF" }));

    expect(
      screen.getByText(
        "¿Generar liquidaciones para todas las unidades funcionales del periodo 202607?",
      ),
    ).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: "Generar" });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    await vi.waitFor(() => {
      expect(onBatchGenerate).toHaveBeenCalledWith({
        period_code: "202607",
      });
    });
  });

  it("closes modal when overlay clicked", () => {
    const onOpenChange = vi.fn();

    render(
      <GenerateModal
        open
        onOpenChange={onOpenChange}
        onGenerate={async () => {}}
        onBatchGenerate={async () => {}}
      />,
    );

    const closeButtons = screen.getAllByLabelText("Cerrar");
    fireEvent.click(closeButtons[0]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
