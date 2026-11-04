import * as z from "zod";
import { validate, clean } from "rut.js";

/**
 * Campos de perfil compartidos por el registro por formulario y el onboarding
 * de Google. Estaban duplicados en sign-up.schema.ts; tenerlos en un solo
 * archivo evita que las dos altas validen distinto.
 */
export const runSchema = z
  .string("Invalid format")
  .trim()
  .transform((val) => clean(val))
  .pipe(
    z
      .string()
      .min(7, "Minimum of 7 characters")
      .max(9, "Maximum of 9 characters")
      .refine((val) => validate(val), { message: "RUN is not valid" }),
  );

export const birthdateSchema = z
  .date({
    error: (issue) => {
      if (issue.input === undefined) return undefined;
      return "The entered date does not exist or has an invalid format";
    },
  })
  .max(new Date(), {
    error: "The birth date cannot be in the future",
  })
  .optional();

export const comunaIdSchema = z
  .number({ error: "Select a municipality" })
  .int()
  .positive({
    error: "Select a municipality",
  });

export const addressSchema = z
  .string()
  .min(1, "Address is required")
  .max(300, "Address cannot exceed 300 characters");
