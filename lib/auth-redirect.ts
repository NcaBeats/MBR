import type { User } from "@/types";

/**
 * Solo rutas internas: empieza con "/" y no con "//" ni "/\" (que el navegador
 * normaliza a un host externo). Sin esto, `?next=https://evil.com` seria un
 * open redirect.
 */
export function safeInternalPath(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return null;
  }
  return value;
}

export function homeForRole(role: User["role"]): string {
  if (role === "ADMIN") {
    return "/admin";
  }
  if (role === "VENDEDOR") {
    return "/studio/games";
  }
  return "/";
}

/** `next` valido si existe; si no, el home del rol. */
export function destinationFor(
  role: User["role"],
  next?: string | null,
): string {
  return safeInternalPath(next) ?? homeForRole(role);
}
