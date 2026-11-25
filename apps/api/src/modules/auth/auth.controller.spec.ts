import "reflect-metadata";
import { afterAll, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import type { INestApplication } from "@nestjs/common";
import { getDrizzleToken } from "@nestjs/drizzle";
import { Test } from "@nestjs/testing";
import { DrizzleQueryError } from "drizzle-orm";
import postgres from "postgres";
import { accounts } from "@/database/schemas/account";
import { type UserRow, users } from "@/database/schemas/user";
import { setupApp } from "@/setup-app";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

// postgres' types declare Error's (message) constructor; at runtime it takes the error fields.
const PgError = postgres.PostgresError as unknown as new (
  fields: Partial<postgres.PostgresError>,
) => postgres.PostgresError;

const uniqueViolation = (constraint_name: string) =>
  new DrizzleQueryError("insert ...", [], new PgError({ code: "23505", constraint_name }));

const userRow: UserRow = {
  id: "0c6a1f0e-5d3b-4a7e-9a51-2f4b8c9d1e23",
  name: "Alice",
  email: "alice@example.com",
  emailVerifiedAt: null,
  phone: null,
  role: "customer",
  disabledAt: null,
  createdAt: new Date("2026-11-25T00:00:00.000Z"),
  updatedAt: new Date("2026-11-25T00:00:00.000Z"),
};

const inserts: { table: unknown; values: Record<string, unknown> }[] = [];

// Just enough of a Drizzle transaction for `insert().values()` and `.returning()`.
const tx = {
  insert: (table: unknown) => ({
    values: (values: Record<string, unknown>) => {
      inserts.push({ table, values });
      const rows = table === users ? [userRow] : [];
      return Object.assign(Promise.resolve(rows), { returning: async () => rows });
    },
  }),
};
const db = { transaction: mock(async (fn: (t: typeof tx) => unknown) => fn(tx)) };

describe("AuthController (HTTP)", () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, { provide: getDrizzleToken(), useValue: db }],
    }).compile();

    app = setupApp(moduleRef.createNestApplication());
    await app.listen(0);
    baseUrl = `${await app.getUrl()}/api/v1`;
  });

  afterAll(() => app.close());

  beforeEach(() => {
    inserts.length = 0;
  });

  const signUp = (body: unknown) =>
    fetch(`${baseUrl}/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  const valid = { name: "Alice", email: "  Alice@Example.com ", password: "correct horse" };

  test("POST /auth/sign-up creates the user and a credential account, returns the user", async () => {
    const res = await signUp(valid);

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      id: userRow.id,
      name: "Alice",
      email: "alice@example.com",
      role: "customer",
      createdAt: "2026-11-25T00:00:00.000Z",
    });

    const [userInsert, accountInsert] = inserts;
    expect(userInsert).toEqual({
      table: users,
      values: { name: "Alice", email: "alice@example.com", phone: undefined },
    });
    expect(accountInsert?.table).toBe(accounts);
    expect(accountInsert?.values).toMatchObject({ userId: userRow.id, provider: "credential" });
    const hash = accountInsert?.values.passwordHash as string;
    expect(hash).toStartWith("$argon2id$");
    expect(await Bun.password.verify("correct horse", hash)).toBe(true);
  });

  test("POST /auth/sign-up returns 400 for an invalid body", async () => {
    const res = await signUp({ ...valid, password: "short" });
    expect(res.status).toBe(400);
    expect(inserts).toHaveLength(0);
  });

  test.each([
    ["users_email_unique", "Email already registered"],
    ["users_phone_unique", "Phone number already registered"],
  ])("POST /auth/sign-up returns 409 on %s", async (constraint, message) => {
    db.transaction.mockImplementationOnce(async () => {
      throw uniqueViolation(constraint);
    });
    const res = await signUp(valid);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ message });
  });

  test("POST /auth/sign-up returns 500 for other database errors", async () => {
    db.transaction.mockImplementationOnce(async () => {
      throw new DrizzleQueryError("insert ...", [], new Error("connection reset"));
    });
    const res = await signUp(valid);
    expect(res.status).toBe(500);
  });
});
