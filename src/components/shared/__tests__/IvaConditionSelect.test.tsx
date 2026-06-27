import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
    render(
      <IvaConditionSelect
        value="RI"
        onChange={(value) => {
          selected = value;
        }}
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "MONOTRIBUTISTA" } });
    expect(selected).toBe("MONOTRIBUTISTA");
  });
});
