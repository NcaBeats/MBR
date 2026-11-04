import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { GoogleOnboardingForm } from "@/components/auth";
import { GOOGLE_ONBOARDING_COOKIE } from "@/lib/cookies";
import type { GoogleOnboardingSession } from "@/types";

import { AuthLayout } from "../../AuthLayout";

/**
 * Formulario que completa el alta con Google. La cookie con el onboardingToken
 * es httpOnly: el token se queda en el servidor y solo el perfil sugerido
 * (email/nombre) llega al cliente.
 */
export default async function GoogleSignUpPage() {
  const store = await cookies();
  const raw = store.get(GOOGLE_ONBOARDING_COOKIE)?.value;

  let session: GoogleOnboardingSession | null = null;
  if (raw) {
    try {
      session = JSON.parse(raw) as GoogleOnboardingSession;
    } catch {
      session = null;
    }
  }

  // Nunca dentro del try: redirect() lanza una excepcion que el catch se tragaria.
  if (!session?.token) {
    redirect("/sign-up");
  }

  return (
    <AuthLayout>
      <GoogleOnboardingForm suggested={session.profile} />
    </AuthLayout>
  );
}
