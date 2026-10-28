import { type INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';

export const API_PREFIX = 'api';

/**
 * Global app configuration shared by `main.ts` and tests,
 * so the test app behaves exactly like the real one.
 */
export function setupApp(app: INestApplication, options: { corsOrigins?: string[] } = {}) {
  app.setGlobalPrefix(API_PREFIX);
  // Validates any @Body/@Query/@Param declared with `{ schema }` (zod schemas from @ticket/shared).
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableShutdownHooks();
  if (options.corsOrigins) app.enableCors({ origin: options.corsOrigins });
  return app;
}
