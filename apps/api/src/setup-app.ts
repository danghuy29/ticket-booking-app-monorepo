import {
  type INestApplication,
  StandardSchemaValidationPipe,
  VersioningType,
} from "@nestjs/common";

export const API_PREFIX = "api";
/** Version applied to every controller that does not declare its own `version`. */
export const DEFAULT_API_VERSION = "1";

/**
 * Global app configuration shared by `main.ts` and tests,
 * so the test app behaves exactly like the real one.
 */
export function setupApp(app: INestApplication, options: { corsOrigins?: string[] } = {}) {
  app.setGlobalPrefix(API_PREFIX);
  // URI versioning: /api/v1/... . A breaking change = new `@Controller({ path, version: "2" })`
  // (or `@Get({ version: "2" })` on one route) while v1 keeps serving old clients.
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: DEFAULT_API_VERSION });
  // Validates any @Body/@Query/@Param declared with `{ schema }` (zod schemas from @ticket/shared).
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableShutdownHooks();
  if (options.corsOrigins) app.enableCors({ origin: options.corsOrigins });
  return app;
}
