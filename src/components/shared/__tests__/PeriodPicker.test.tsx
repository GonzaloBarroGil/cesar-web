import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PeriodPicker } from "../PeriodPicker";

const samplePeriods = [
  { id: "1", code: "202606", status: "OPEN" },
  { id: "2", code: "202605", status: "CLOSED" },
  { id: "3", code: "202604", status: "ARCHIVED" },
];

describe("PeriodPicker", () => {
  it("renders all periods as options", () => {
    render(<PeriodPicker periods={samplePeriods} value="202606" onChange={() => {}} />);
    expect(screen.getByText(/202606.*Activo/)).toBeInTheDocument();
    expect(screen.getByText(/202605.*Cerrado/)).toBeInTheDocument();
    expect(screen.getByText("202604")).toBeInTheDocument();
  });

  it("shows empty message when no periods", () => {
    render(<PeriodPicker periods={[]} value="" onChange={() => {}} />);
    expect(screen.getByText("Sin períodos")).toBeInTheDocument();
  });

  it("calls onChange with period code on selection", () => {
    let selected = "";
    render(<PeriodPicker periods={samplePeriods} value="202606" onChange={(code) => { selected = code; }} />);
    fireEvent.change(document.querySelector("select")!, { target: { value: "202605" } });
    expect(selected).toBe("202605");
  });

  it("shows current value as selected", () => {
    render(<PeriodPicker periods={samplePeriods} value="202605" onChange={() => {}} />);
    expect((document.querySelector("select") as HTMLSelectElement).value).toBe("202605");
  });

  it("highlights open period text", () => {
    render(<PeriodPicker periods={samplePeriods} value="202605" onChange={() => {}} />);
    expect(screen.getByText(/202606.*Activo/)).toBeInTheDocument();
  });
});
