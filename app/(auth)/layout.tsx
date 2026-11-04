import { redirect } from "next/navigation";

import { getCurrentUserAction } from "@/actions/admin/auth";
import { homeForRole } from "@/lib/auth-redirect";

export default async function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const user = await getCurrentUserAction();

  // Un usuario ya autenticado no tiene nada que hacer en /log-in o /sign-up.
  if (user) {
    redirect(homeForRole(user.role));
  }

  return <main>{children}</main>;
}
