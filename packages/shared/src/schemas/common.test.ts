import { describe, expect, test } from 'bun:test';
import { paginationQuerySchema } from './common';

describe('paginationQuerySchema', () => {
  test('applies defaults', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ limit: 20, offset: 0 });
  });

  test('coerces query-string values', () => {
    expect(paginationQuerySchema.parse({ limit: '5', offset: '10' })).toEqual({
      limit: 5,
      offset: 10,
    });
  });

  test('rejects a limit above 100', () => {
    expect(paginationQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});
