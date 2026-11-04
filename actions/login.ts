"use server";

import { fetchAPI } from "@/lib/api/fetch";
import { ApiError } from "@/lib/api/errors";
import {
  getRoleForToken,
  redirectAfterAuth,
  setSessionCookie,
} from "@/lib/session";
import type { AuthToken, User } from "@/types";
import { LoginSchema } from "@/schemas";
import { z } from "zod";

export async function loginAction(
  values: z.infer<typeof LoginSchema>,
  next?: string | null,
) {
  const { email, password } = values;

  let role: User["role"];

  try {
    const data = await fetchAPI<AuthToken>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    role = await getRoleForToken(data.token);

    await setSessionCookie(data.token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return {
        success: false,
        errors: {
          global: ["Invalid email or password."],
        },
      };
    }

    return {
      success: false,
      errors: {
        global: ["Server error. Please try again."],
      },
    };
  }

  redirectAfterAuth(role, next);
}
