"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Script from "next/script";

import { googleLoginAction } from "@/actions/google";

const GIS_SCRIPT = "https://accounts.google.com/gsi/client";
const MIN_WIDTH = 200;
const MAX_WIDTH = 350;

type GoogleSignInButtonProps = {
  /** Texto del boton que renderiza Google. */
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  /** Ruta interna a la que volver despues del login (query `?next=`). */
  next?: string | null;
};

/**
 * Boton oficial de Google Identity Services.
 *
 * <p>Google renderiza un iframe con su propio estilo, asi que no se puede
 * personalizar con CSS: solo se eligen `theme`, `shape`, `size`, `text` y
 * `width`. El ancho se mide del contenedor porque `width` es un MINIMO: un
 * valor fijo desborda el card en pantallas angostas.
 *
 * <p>El callback que se le pasa a `next/script` queda congelado en el primer
 * render, cuando el ancho todavia no se midio. Por eso `renderButton` NO
 * depende del ancho: lo lee de un ref. Si dependiera del estado, en una recarga
 * completa el `onLoad` llamaria al callback viejo (width=null) y el boton
 * nunca apareceria.
 */
export function GoogleSignInButton({
  text = "continue_with",
  next = null,
}: GoogleSignInButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef<number | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCredential = useCallback(
    (response: GoogleCredentialResponse) => {
      setError(null);
      startTransition(async () => {
        const result = await googleLoginAction(response.credential, next);
        if (!result.success) {
          setError(result.error);
        }
      });
    },
    [next, startTransition],
  );

  const renderButton = useCallback(() => {
    const measured = widthRef.current;
    if (
      !clientId ||
      !containerRef.current ||
      !window.google?.accounts?.id ||
      measured === null
    ) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential,
      ux_mode: "popup",
    });

    containerRef.current.replaceChildren();
    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text,
      logo_alignment: "left",
      locale: "en",
      width: measured,
    });
  }, [clientId, handleCredential, text]);

  // El ancho se guarda en un ref (lo lee el callback estable) y en estado (para
  // re-renderizar el iframe cuando cambia el layout).
  useEffect(() => {
    const measure = () => {
      const available = wrapperRef.current?.clientWidth ?? 0;
      const measured = Math.max(
        MIN_WIDTH,
        Math.min(available || MIN_WIDTH, MAX_WIDTH),
      );
      widthRef.current = measured;
      setWidth(measured);
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measure);
    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Cubre el remount (navegacion client-side): el script ya esta cargado y
  // `onLoad` no vuelve a dispararse.
  useEffect(() => {
    if (width !== null && window.google?.accounts?.id) {
      renderButton();
    }
  }, [width, renderButton]);

  if (!clientId) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Script
        src={GIS_SCRIPT}
        strategy="afterInteractive"
        onLoad={renderButton}
        onError={() => setError("Google sign-in is not available right now.")}
      />
      <div ref={wrapperRef} className="flex w-full justify-center">
        <div
          ref={containerRef}
          className={isPending ? "pointer-events-none opacity-60" : undefined}
        />
      </div>
      {error && (
        <p className="text-center text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
