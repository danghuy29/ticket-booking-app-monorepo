import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, mock, test } from 'bun:test';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DB } from '../../database/database.module';
import { setupApp } from '../../setup-app';
import { HealthController } from './health.controller';

// Example HTTP-level test: real Nest app + global pipes, with the database mocked.
const db = { execute: mock(async () => [{ '?column?': 1 }]) };

describe('HealthController (HTTP)', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: DB, useValue: db }],
    }).compile();

    app = setupApp(moduleRef.createNestApplication());
    await app.listen(0);
    baseUrl = `${await app.getUrl()}/api`;
  });

  afterAll(() => app.close());

  test('GET /health returns ok when the database responds', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok', database: 'up' });
  });

  test('GET /health returns 503 when the database is down', async () => {
    db.execute.mockImplementationOnce(async () => {
      throw new Error('connection refused');
    });
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(503);
  });
});
