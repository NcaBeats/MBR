import * as z from "zod";
import {
  addressSchema,
  birthdateSchema,
  comunaIdSchema,
  runSchema,
} from "./profile-fields";

const nickname = z
  .string("Nickname is required")
  .trim()
  .min(1, "Nickname is required")
  .max(255, "Nickname cannot exceed 255 characters");

export const googleOnboardingSchema = z.object({
  run: runSchema,
  nickname,
  birthdate: birthdateSchema,
  comunaId: comunaIdSchema,
  direccion: addressSchema,
});

export type GoogleOnboardingInput = z.infer<typeof googleOnboardingSchema>;
