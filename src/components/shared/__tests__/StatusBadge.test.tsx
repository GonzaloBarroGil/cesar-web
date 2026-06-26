import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders ACTIVE status with green styling", () => {
    render(<StatusBadge status="ACTIVE" />);
    const badge = screen.getByText("Activo");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-green-100", "text-green-800");
  });

  it("renders PENDING status with yellow styling", () => {
    render(<StatusBadge status="PENDING" />);
    const badge = screen.getByText("Pendiente");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-yellow-100", "text-yellow-800");
  });

  it("renders REJECTED status with red styling", () => {
    render(<StatusBadge status="REJECTED" />);
    const badge = screen.getByText("Rechazado");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-red-100", "text-red-800");
  });

  it("renders DRAFT status", () => {
    render(<StatusBadge status="DRAFT" />);
    expect(screen.getByText("Borrador")).toBeInTheDocument();
  });

  it("renders ISSUED status", () => {
    render(<StatusBadge status="ISSUED" />);
    expect(screen.getByText("Emitido")).toBeInTheDocument();
  });

  it("renders ANULADA with strikethrough", () => {
    render(<StatusBadge status="ANULADA" />);
    const badge = screen.getByText("Anulado");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("line-through");
  });

  it("renders OPEN period status", () => {
    render(<StatusBadge status="OPEN" />);
    expect(screen.getByText("Abierto")).toBeInTheDocument();
  });

  it("renders CLOSED period status", () => {
    render(<StatusBadge status="CLOSED" />);
    expect(screen.getByText("Cerrado")).toBeInTheDocument();
  });

  it("renders ARCHIVED period status", () => {
    render(<StatusBadge status="ARCHIVED" />);
    expect(screen.getByText("Archivado")).toBeInTheDocument();
  });

  it("renders INCOME direction as green", () => {
    render(<StatusBadge status="INCOME" />);
    const badge = screen.getByText("Ingreso");
    expect(badge).toHaveClass("bg-green-100");
  });

  it("renders OUTPUT direction as red", () => {
    render(<StatusBadge status="OUTPUT" />);
    const badge = screen.getByText("Egreso");
    expect(badge).toHaveClass("bg-red-100");
  });

  it("renders ORDINARIA expense type", () => {
    render(<StatusBadge status="ORDINARIA" />);
    expect(screen.getByText("Ordinaria")).toBeInTheDocument();
  });

  it("renders EXTRAORDINARIA expense type", () => {
    render(<StatusBadge status="EXTRAORDINARIA" />);
    expect(screen.getByText("Extraordinaria")).toBeInTheDocument();
  });

  it("falls back to raw status for unknown values", () => {
    render(<StatusBadge status="SOME_UNKNOWN_STATUS" />);
    const badge = screen.getByText("SOME_UNKNOWN_STATUS");
    expect(badge).toHaveClass("bg-neutral-100");
  });

  it("renders with correct badge base classes", () => {
    render(<StatusBadge status="ACTIVE" />);
    const badge = screen.getByText("Activo");
    expect(badge).toHaveClass("inline-flex", "items-center", "rounded-md", "border", "text-xs", "font-medium");
  });
});
