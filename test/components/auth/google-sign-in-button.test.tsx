import { describe, test, expect, vi, afterEach } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { googleLoginAction } from "@/actions/google";

vi.mock("@/actions/google", () => ({
  googleLoginAction: vi.fn(),
}));

const scriptMock = vi.hoisted(() => ({
  onLoad: null as null | (() => void),
  onError: null as null | (() => void),
}));

vi.mock("next/script", () => ({
  default: (props: { onLoad?: () => void; onError?: () => void }) => {
    scriptMock.onLoad = props.onLoad ?? null;
    scriptMock.onError = props.onError ?? null;
    return null;
  },
}));

const mockedLogin = vi.mocked(googleLoginAction);

function installGoogleMock() {
  const initialize = vi.fn();
  const renderButton = vi.fn();

  window.google = {
    accounts: {
      id: {
        initialize,
        renderButton,
        prompt: vi.fn(),
        disableAutoSelect: vi.fn(),
      },
    },
  };

  return { initialize, renderButton };
}

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  scriptMock.onLoad = null;
  scriptMock.onError = null;
  delete window.google;
});

describe("GoogleSignInButton", () => {
  test("sin NEXT_PUBLIC_GOOGLE_CLIENT_ID no renderiza nada", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "");

    const { container } = render(<GoogleSignInButton />);

    expect(container).toBeEmptyDOMElement();
  });

  test("con el script ya cargado inicializa GIS y renderiza el boton", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "test-client-id");
    const { initialize, renderButton } = installGoogleMock();

    render(<GoogleSignInButton />);

    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "test-client-id" }),
    );
    expect(renderButton).toHaveBeenCalledTimes(1);
  });

  test("renderiza cuando el script carga DESPUES del montaje (recarga completa)", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "test-client-id");

    render(<GoogleSignInButton />);

    // El script todavia no cargo.
    expect(window.google).toBeUndefined();

    // next/script dispara onLoad con el callback congelado del primer render.
    const { initialize, renderButton } = installGoogleMock();
    act(() => {
      scriptMock.onLoad?.();
    });

    expect(initialize).toHaveBeenCalled();
    expect(renderButton).toHaveBeenCalledTimes(1);
  });

  test("envia el credential y el next a la server action", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "test-client-id");
    const { initialize } = installGoogleMock();
    mockedLogin.mockResolvedValue({ success: true });

    render(<GoogleSignInButton next="/cart" />);

    const options = initialize.mock.calls[0][0] as {
      callback: (response: { credential: string }) => void;
    };
    options.callback({ credential: "cred-123" });

    await waitFor(() =>
      expect(mockedLogin).toHaveBeenCalledWith("cred-123", "/cart"),
    );
  });

  test("muestra el error que devuelve la action", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "test-client-id");
    const { initialize } = installGoogleMock();
    mockedLogin.mockResolvedValue({
      success: false,
      error:
        "Only @duoc.cl, @profesor.duoc.cl and @gmail.com accounts are allowed.",
    });

    render(<GoogleSignInButton />);

    const options = initialize.mock.calls[0][0] as {
      callback: (response: { credential: string }) => void;
    };
    options.callback({ credential: "cred-123" });

    expect(await screen.findByRole("alert")).toHaveTextContent("Only @duoc.cl");
  });

  test("muestra un error si el script no carga", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "test-client-id");

    render(<GoogleSignInButton />);

    act(() => {
      scriptMock.onError?.();
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Google sign-in is not available right now.",
    );
  });
});
