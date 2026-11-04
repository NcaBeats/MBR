export type GoogleAuthStatus = "AUTHENTICATED" | "ONBOARDING_REQUIRED";

export type GoogleSuggestedProfile = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  picture?: string | null;
};

export type GoogleAuthResponse = {
  status: GoogleAuthStatus;
  token: string | null;
  expiresIn: number | null;
  onboardingToken: string | null;
  suggestedProfile: GoogleSuggestedProfile | null;
};

/** Contenido de la cookie httpOnly que puentea login y formulario de onboarding. */
export type GoogleOnboardingSession = {
  token: string;
  profile: GoogleSuggestedProfile | null;
  /** Ruta interna a la que volver al terminar (validada por el backend de acciones). */
  next?: string | null;
};
