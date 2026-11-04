export const SESSION_COOKIE = "token";
export const GOOGLE_ONBOARDING_COOKIE = "google_onboarding";

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Cookie de sesión: vive lo mismo que el JWT (1 hora). */
export const COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 3600,
};

/** Puente entre el login con Google y el formulario de onboarding (10 min). */
export const GOOGLE_ONBOARDING_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 600,
};
