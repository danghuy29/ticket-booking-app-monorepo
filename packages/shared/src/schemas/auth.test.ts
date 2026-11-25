import { describe, expect, test } from "bun:test";
import { loginSchema, registerSchema } from "./auth";

const validRegister = { name: "Huy", email: "huy@gmail.com", password: "password1" };

describe("registerSchema", () => {
  test("trims and lowercases the email before validating it", () => {
    const result = registerSchema.parse({ ...validRegister, email: "  Huy@Gmail.com " });
    expect(result.email).toBe("huy@gmail.com");
  });

  test("rejects an invalid email", () => {
    expect(registerSchema.safeParse({ ...validRegister, email: "bad" }).success).toBe(false);
  });

  test("keeps the password exactly as typed (no trimming)", () => {
    const result = registerSchema.parse({ ...validRegister, password: "  pass1234  " });
    expect(result.password).toBe("  pass1234  ");
  });

  test("rejects passwords shorter than 8 or longer than 128 characters", () => {
    expect(registerSchema.safeParse({ ...validRegister, password: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...validRegister, password: "a".repeat(129) }).success).toBe(
      false,
    );
  });

  test("rejects a blank name and trims a padded one", () => {
    expect(registerSchema.safeParse({ ...validRegister, name: "   " }).success).toBe(false);
    expect(registerSchema.parse({ ...validRegister, name: "  Huy " }).name).toBe("Huy");
  });

  test("treats a missing or blank phone as undefined", () => {
    expect(registerSchema.parse(validRegister).phone).toBeUndefined();
    expect(registerSchema.parse({ ...validRegister, phone: "" }).phone).toBeUndefined();
    expect(registerSchema.parse({ ...validRegister, phone: "   " }).phone).toBeUndefined();
  });

  test("keeps a provided phone, trimmed", () => {
    const result = registerSchema.parse({ ...validRegister, phone: " +84123456789 " });
    expect(result.phone).toBe("+84123456789");
  });

  test("reports every invalid field", () => {
    const result = registerSchema.safeParse({ name: "", email: "bad", password: "x" });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path.join(".")).sort();
    expect(paths).toEqual(["email", "name", "password"]);
  });
});

describe("loginSchema", () => {
  test("normalises the email the same way as register", () => {
    const result = loginSchema.parse({ email: " Huy@Gmail.com", password: "x" });
    expect(result.email).toBe("huy@gmail.com");
  });

  test("accepts a short password (length rules only apply at registration)", () => {
    expect(loginSchema.safeParse({ email: "huy@gmail.com", password: "x" }).success).toBe(true);
  });

  test("rejects an empty or oversized password", () => {
    expect(loginSchema.safeParse({ email: "huy@gmail.com", password: "" }).success).toBe(false);
    expect(
      loginSchema.safeParse({ email: "huy@gmail.com", password: "a".repeat(129) }).success,
    ).toBe(false);
  });
});
