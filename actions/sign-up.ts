"use server";

import { format } from "date-fns";
import * as z from "zod";

import { fetchAPI } from "@/lib/api/fetch";
import {
  getRoleForToken,
  redirectAfterAuth,
  setSessionCookie,
} from "@/lib/session";
import type { AuthToken, User } from "@/types";
import { signUpSchema } from "@/schemas/auth/sign-up.schema";

export async function signUpAction(
  values: z.infer<typeof signUpSchema>,
  next?: string | null,
) {
  const result = signUpSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false as const,
      errors: z.flattenError(result.error).fieldErrors,
    };
  }

  const {
    run,
    name,
    lastName,
    email,
    password,
    birthdate,
    comunaId,
    direccion,
  } = result.data;

  let token: string;
  let role: User["role"];

  try {
    const data = await fetchAPI<AuthToken>("/auth/register", {
      method: "POST",
      body: {
        run,
        firstName: name,
        lastName,
        email,
        password,

        birthDate: birthdate ? format(birthdate, "yyyy-MM-dd") : undefined,

        comunaId,
        address: direccion,
      },
    });

    token = data.token;
    role = await getRoleForToken(token);
  } catch {
    return {
      success: false as const,
      errors: {
        global: ["Registration failed. Please try again."],
      },
    };
  }

  // El backend ya devuelve el token: se entra directo, sin pasar por /log-in.
  await setSessionCookie(token);
  redirectAfterAuth(role, next);
}
