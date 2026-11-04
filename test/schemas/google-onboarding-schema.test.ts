import { describe, test, expect } from "vitest";
import * as z from "zod";

import { googleOnboardingSchema } from "@/schemas/auth/google-onboarding.schema";

const valid = {
  run: "19.011.022-2",
  nickname: "nuevo",
  birthdate: undefined,
  comunaId: 1,
  direccion: "Calle 123",
};

describe("googleOnboardingSchema", () => {
  test("acepta datos validos y limpia el RUN", () => {
    const result = googleOnboardingSchema.safeParse(valid);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.run).toBe("190110222");
    }
  });

  test("rechaza un RUN con digito verificador invalido", () => {
    const result = googleOnboardingSchema.safeParse({
      ...valid,
      run: "19011022K",
    });

    expect(result.success).toBe(false);
  });

  test("rechaza nickname y direccion vacios", () => {
    const result = googleOnboardingSchema.safeParse({
      ...valid,
      nickname: "",
      direccion: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      expect(errors.nickname).toContain("Nickname is required");
      expect(errors.direccion).toContain("Address is required");
    }
  });
});
