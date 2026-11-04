"use server";

import { cookies } from "next/headers";
import { fetchAPI } from "@/lib/api/fetch";
import { SESSION_COOKIE } from "@/lib/cookies";

export async function logoutAction() {
  try {
    await fetchAPI("/auth/logout", { method: "POST", auth: true });
  } catch {}
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
