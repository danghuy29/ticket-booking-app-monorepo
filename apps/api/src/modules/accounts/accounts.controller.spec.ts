import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import type { INestApplication } from "@nestjs/common";
import { getDrizzleToken } from "@nestjs/drizzle";
import { Test } from "@nestjs/testing";
import { setupApp } from "@/setup-app";
import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";

const account = {
  id: "5b0f6d2e-8c1a-4f3b-9e7d-1a2b3c4d5e6f",
  userId: "0c6a1f0e-5d3b-4a7e-9a51-2f4b8c9d1e23",
  provider: "credential",
  providerAccountId: null,
  createdAt: "2026-11-25T00:00:00.000Z",
  updatedAt: "2026-11-25T00:00:00.000Z",
  user: { id: "0c6a1f0e-5d3b-4a7e-9a51-2f4b8c9d1e23", name: "Alice", email: "alice@example.com" },
};
const findMany = mock(async (_config: unknown) => [account]);
const db = { query: { accounts: { findMany } } };

describe("AccountsController (HTTP)", () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [AccountsService, { provide: getDrizzleToken(), useValue: db }],
    }).compile();

    app = setupApp(moduleRef.createNestApplication());
    await app.listen(0);
    baseUrl = `${await app.getUrl()}/api/v1`;
  });

  afterAll(() => app.close());

  test("GET /accounts lists accounts with their user, never selecting passwordHash", async () => {
    const res = await fetch(`${baseUrl}/accounts`);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([account]);
    expect(findMany.mock.calls[0]?.[0]).toMatchObject({ columns: { passwordHash: false } });
  });
});
