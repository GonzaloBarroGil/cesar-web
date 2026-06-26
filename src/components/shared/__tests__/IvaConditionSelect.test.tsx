import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IvaConditionSelect } from "../IvaConditionSelect";

describe("IvaConditionSelect", () => {
  it("renders all 4 IVA conditions", () => {
    render(<IvaConditionSelect value="RI" onChange={() => {}} />);
    expect(screen.getByText(/RI.*Responsable Inscripto/)).toBeInTheDocument();
    expect(screen.getByText(/EXENTO.*Exento/)).toBeInTheDocument();
    expect(screen.getByText(/MONOTRIBUTISTA.*Monotributista/)).toBeInTheDocument();
    expect(screen.getByText(/CF.*Consumidor Final/)).toBeInTheDocument();
  });

  it("shows current value as selected", () => {
    render(<IvaConditionSelect value="EXENTO" onChange={() => {}} />);
    expect((document.querySelector("select") as HTMLSelectElement).value).toBe("EXENTO");
  });

  it("calls onChange with new IVA condition on selection", () => {
    let selected = "";
    render(<IvaConditionSelect value="RI" onChange={(value) => { selected = value; }} />);
    fireEvent.change(document.querySelector("select")!, { target: { value: "MONOTRIBUTISTA" } });
    expect(selected).toBe("MONOTRIBUTISTA");
  });
});
