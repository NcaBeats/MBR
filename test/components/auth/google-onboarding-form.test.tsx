import { describe, test, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { GoogleOnboardingForm } from "@/components/auth/GoogleOnboardingForm";

vi.mock("@/actions/google", () => ({
  googleCompleteAction: vi.fn(),
}));

vi.mock("@/hooks/use-location", () => ({
  useRegions: () => ({ regions: [], loading: false, error: null }),
  useComunas: () => ({ comunas: [], loading: false }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const suggested = {
  email: "nuevo@gmail.com",
  firstName: "Nuevo",
  lastName: "Usuario",
  picture: null,
};

describe("GoogleOnboardingForm", () => {
  test("precarga el nickname con la parte local del email", () => {
    render(<GoogleOnboardingForm suggested={suggested} />);

    expect(screen.getByText("nuevo@gmail.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("gamer123")).toHaveValue("nuevo");
  });

  test("enviar vacio muestra los errores de requerido", async () => {
    render(<GoogleOnboardingForm suggested={suggested} />);

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("Minimum of 7 characters"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Address is required")).toBeInTheDocument();
    expect(
      await screen.findByText("Select a municipality"),
    ).toBeInTheDocument();
  });

  test("rechaza un RUN con digito verificador invalido", async () => {
    render(<GoogleOnboardingForm suggested={suggested} />);

    fireEvent.change(screen.getByPlaceholderText("12.345.678-9"), {
      target: { value: "19011022K" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("RUN is not valid")).toBeInTheDocument();
  });

  test("el nickname vacio se rechaza", async () => {
    render(<GoogleOnboardingForm suggested={suggested} />);

    fireEvent.change(screen.getByPlaceholderText("gamer123"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Nickname is required")).toBeInTheDocument();
  });
});
