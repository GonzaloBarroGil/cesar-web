import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CaeQrDisplay } from "../CaeQrDisplay";

describe("CaeQrDisplay", () => {
  it("[@display] shows CAE number", () => {
    render(
      <MemoryRouter>
        <CaeQrDisplay cae="12345678901234" caeVencimiento="2099-12-31" />
      </MemoryRouter>,
    );

    expect(screen.getByText("CAE")).toBeInTheDocument();
    expect(screen.getByText("12345678901234")).toBeInTheDocument();
  });

  it("[@display] shows vencimiento date", () => {
    render(
      <MemoryRouter>
        <CaeQrDisplay cae="12345678901234" caeVencimiento="2099-12-31" />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Vencimiento:/)).toBeInTheDocument();
    expect(screen.getByText("CAE valido")).toBeInTheDocument();
  });

  it("shows expired badge when vencimiento is past", () => {
    render(
      <MemoryRouter>
        <CaeQrDisplay cae="12345678901234" caeVencimiento="2020-01-01" />
      </MemoryRouter>,
    );

    expect(screen.getByText("CAE vencido")).toBeInTheDocument();
    expect(screen.queryByText("CAE valido")).not.toBeInTheDocument();
  });

  it("[@display] renders QR placeholder with accessible label", () => {
    render(
      <MemoryRouter>
        <CaeQrDisplay
          cae="12345678901234"
          caeVencimiento="2099-12-31"
          qrCode="https://qr.afip.gob.ar?cae=12345678901234"
        />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Codigo QR ARCA")).toBeInTheDocument();
  });

  it("omits vencimiento line when not provided", () => {
    render(
      <MemoryRouter>
        <CaeQrDisplay cae="12345678901234" />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/Vencimiento:/)).not.toBeInTheDocument();
    expect(screen.getByText("CAE valido")).toBeInTheDocument();
  });
});
