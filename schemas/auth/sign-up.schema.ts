import * as z from "zod";
import { passwordSchema } from "@/schemas/password.schema";
import {
  addressSchema,
  birthdateSchema,
  comunaIdSchema,
  runSchema,
} from "./profile-fields";

const domains = new Set(["duoc.cl", "profesor.duoc.cl", "gmail.com"]);

const name = z
  .string()
  .trim()
  .min(1, "First name is required")
  .max(50, "Maximun of 50 characters");

const lastName = z
  .string()
  .trim()
  .min(1, "Last name is required")
  .max(50, "Maximun of 50 characters");

const email = z
  .string()
  .trim()
  .max(100, "Email cannot exceed 100 characters")
  .pipe(z.email("Invalid email format"))
  .refine(
    (val) => {
      const domain = val.split("@").pop()?.toLowerCase();
      return domains.has(domain || "");
    },
    {
      message: "Only @duoc.cl @profesor.duoc.cl @gmail.com domains",
    },
  );

const password = passwordSchema;

const confirmPassword = z.string();

export const signUpSchema = z
  .object({
    run: runSchema,
    name: name,
    lastName: lastName,
    email: email,
    birthdate: birthdateSchema,
    comunaId: comunaIdSchema,
    direccion: addressSchema,
    password: password,
    confirmPassword: confirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["password"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
