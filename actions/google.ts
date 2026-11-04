"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import * as z from "zod";

import { fetchAPI } from "@/lib/api/fetch";
import { ApiError } from "@/lib/api/errors";
import { safeInternalPath } from "@/lib/auth-redirect";
import {
  GOOGLE_ONBOARDING_COOKIE,
  GOOGLE_ONBOARDING_COOKIE_OPTIONS,
} from "@/lib/cookies";
import {
  getRoleForToken,
  redirectAfterAuth,
  setSessionCookie,
} from "@/lib/session";
import {
  googleOnboardingSchema,
  type GoogleOnboardingInput,
} from "@/schemas/auth/google-onboarding.schema";
import type {
  AuthToken,
  GoogleAuthResponse,
  GoogleOnboardingSession,
  User,
} from "@/types";

export type GoogleActionResult =
  { success: true } | { success: false; error: string };

function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "GOOGLE_SIGN_IN_NOT_CONFIGURED") {
      return "Google sign-in is not available right now.";
    }
    if (error.code === "EMAIL_DOMAIN_NOT_ALLOWED") {
      return "Only @duoc.cl, @profesor.duoc.cl and @gmail.com accounts are allowed.";
    }
    if (error.status === 401) {
      return "We couldn't verify your Google account. Please try again.";
    }
  }
  return "Google sign-in failed. Please try again.";
}

function readOnboardingSession(
  raw: string | undefined,
): GoogleOnboardingSession | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as GoogleOnboardingSession;
  } catch {
    return null;
  }
}

/**
 * Paso 1: recibe el credential de Google Identity Services.
 *
 * <p>Si la cuenta existe, setea la cookie de sesión y redirige por rol (igual
 * que `loginAction`). Si es nueva, guarda el onboardingToken en una cookie
 * httpOnly de 10 minutos y manda al formulario: el token nunca toca JS.
 */
export async function googleLoginAction(
  credential: string,
  next?: string | null,
): Promise<GoogleActionResult> {
  if (!credential) {
    return { success: false, error: "Missing Google credential." };
  }

  let data: GoogleAuthResponse;
  try {
    data = await fetchAPI<GoogleAuthResponse>("/auth/google", {
      method: "POST",
      body: { idToken: credential },
    });
  } catch (error) {
    return { success: false, error: loginErrorMessage(error) };
  }

  if (data.status === "ONBOARDING_REQUIRED") {
    if (!data.onboardingToken) {
      return {
        success: false,
        error: "Google sign-in failed. Please try again.",
      };
    }

    const session: GoogleOnboardingSession = {
      token: data.onboardingToken,
      profile: data.suggestedProfile,
      next: safeInternalPath(next),
    };
    const store = await cookies();
    store.set(
      GOOGLE_ONBOARDING_COOKIE,
      JSON.stringify(session),
      GOOGLE_ONBOARDING_COOKIE_OPTIONS,
    );

    redirect("/sign-up/google");
  }

  if (!data.token) {
    return {
      success: false,
      error: "Google sign-in failed. Please try again.",
    };
  }

  let role: User["role"];
  try {
    role = await getRoleForToken(data.token);
  } catch {
    return {
      success: false,
      error: "Google sign-in failed. Please try again.",
    };
  }

  await setSessionCookie(data.token);
  redirectAfterAuth(role, next);
}

/** Paso 2: crea la cuenta con RUN/nickname/region y deja la sesión iniciada. */
export async function googleCompleteAction(
  values: GoogleOnboardingInput,
): Promise<GoogleActionResult> {
  const parsed = googleOnboardingSchema.safeParse(values);
  if (!parsed.success) {
    const firstError = Object.values(z.flattenError(parsed.error).fieldErrors)
      .flat()
      .find(Boolean);
    return { success: false, error: firstError ?? "Invalid data." };
  }

  const store = await cookies();
  const session = readOnboardingSession(
    store.get(GOOGLE_ONBOARDING_COOKIE)?.value,
  );

  if (!session?.token) {
    return {
      success: false,
      error: "Your Google session expired. Please sign in again.",
    };
  }

  const { run, nickname, birthdate, comunaId, direccion } = parsed.data;

  let data: AuthToken;
  let role: User["role"];
  try {
    data = await fetchAPI<AuthToken>("/auth/google/complete", {
      method: "POST",
      body: {
        onboardingToken: session.token,
        run,
        nickname,
        birthDate: birthdate ? format(birthdate, "yyyy-MM-dd") : undefined,
        comunaId,
        address: direccion,
      },
    });
    role = await getRoleForToken(data.token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      store.delete(GOOGLE_ONBOARDING_COOKIE);
      return {
        success: false,
        error: "Your Google session expired. Please sign in again.",
      };
    }
    if (error instanceof ApiError && error.status === 409) {
      return {
        success: false,
        error: "That RUN or nickname is already in use.",
      };
    }
    return {
      success: false,
      error: "We couldn't create your account. Please try again.",
    };
  }

  store.delete(GOOGLE_ONBOARDING_COOKIE);
  await setSessionCookie(data.token);
  redirectAfterAuth(role, session.next);
}
