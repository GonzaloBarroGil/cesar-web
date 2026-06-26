import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CUITInput, cuitChecksum } from "../CUITInput";

describe("CUITInput", () => {
  it("renders an input with numeric input mode", () => {
    render(<CUITInput value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText("XX-XXXXXXXX-X")).toBeInTheDocument();
  });

  it("shows error for valid length but invalid checksum", () => {
    render(<CUITInput value="30711111110" onChange={() => {}} />);
    expect(screen.getByText("CUIT inválido. Verifique los dígitos.")).toBeInTheDocument();
  });

  it("shows no error for valid CUIT", () => {
    render(<CUITInput value="30711111111" onChange={() => {}} />);
    expect(screen.queryByText(/CUIT inválido/)).not.toBeInTheDocument();
    expect(screen.queryByText(/CUIT debe tener 11 dígitos/)).not.toBeInTheDocument();
  });

  it("shows length progress message for partial input", () => {
    render(<CUITInput value="307111" onChange={() => {}} />);
    expect(screen.getByText(/CUIT debe tener 11 dígitos \(6\/11\)/)).toBeInTheDocument();
  });

  it("shows no error for empty input", () => {
    render(<CUITInput value="" onChange={() => {}} />);
    expect(screen.queryByText(/CUIT/)).not.toBeInTheDocument();
  });
});

describe("cuitChecksum", () => {
  it("returns true for valid CUIT", () => {
    expect(cuitChecksum("30711111111")).toBe(true);
  });

  it("returns false for invalid checksum", () => {
    expect(cuitChecksum("30711111112")).toBe(false);
  });

  it("returns false for non-11-digit strings", () => {
    expect(cuitChecksum("123")).toBe(false);
    expect(cuitChecksum("123456789012")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(cuitChecksum("")).toBe(false);
  });

  it("returns false for non-numeric characters", () => {
    expect(cuitChecksum("abcdefghijk")).toBe(false);
  });
});
