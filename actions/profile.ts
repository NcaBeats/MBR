"use server";

import { fetchAPI } from "@/lib/api/fetch";
import { fetchOrNull } from "@/lib/api/errors";
import type { Profile } from "@/types";

export async function getMyProfileAction(): Promise<Profile | null> {
  return fetchOrNull(() => fetchAPI<Profile>("/profile", { auth: true }));
}
