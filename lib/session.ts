import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchAPI } from "@/lib/api/fetch";
import { destinationFor, homeForRole } from "@/lib/auth-redirect";
import { COOKIE_OPTIONS, SESSION_COOKIE } from "@/lib/cookies";
import type { User } from "@/types";

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
}

export async function getRoleForToken(token: string): Promise<User["role"]> {
  const me = await fetchAPI<User>("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return me.role;
}

/** Destino por defecto segun el rol (sin `?next=`). */
export function redirectByRole(role: User["role"]): never {
  redirect(homeForRole(role));
}

/** `next` valido si vino en la URL; si no, el home del rol. */
export function redirectAfterAuth(
  role: User["role"],
  next?: string | null,
): never {
  redirect(destinationFor(role, next));
}
