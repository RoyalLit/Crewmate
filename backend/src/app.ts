/**
 * Express application factory.
 *
 * Creates and configures the Express app without starting the HTTP server.
 * Keeping the app factory separate from server.ts makes the app fully testable
 * (Supertest can import this without binding to a port).
 *
 * Middleware order matters. This is the enforced order:
 *   1. Security headers (helmet)
 *   2. CORS
 *   3. Request context (AsyncLocalStorage — must be before requestLogger so pino-http
 *      picks up the generated requestId and downstream code can access the context)
 *   4. Request logging (pino-http)
 *   5. Body parsers
 *   6. Metrics collection
 *   7. Routes
 *   8. Metrics endpoint
 *   9. 404 handler
 *  10. Error handler (must be last — 4 arguments)
 */

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

import env from './config/env';
import errorHandler from './middleware/errorHandler';
import notFound from './middleware/notFound';
import { requestContextMiddleware } from './middleware/requestContext';
import requestLogger from './middleware/requestLogger';
import { isDatabaseConnected } from './db/connection';
import { metricsMiddleware, metricsHandler } from './middleware/metrics';
import router from './routes/index';

export function createApp(): express.Application {
  const app = express();

  // ── 1. Security headers ─────────────────────────────────────────────────
  // Helmet sets secure HTTP headers (XSS protection, content-type sniffing, etc.)
  // per ARCHITECTURE.md §10 security checklist.
  app.use(helmet());

  // ── 2. CORS ─────────────────────────────────────────────────────────────
  // Restricted to the mobile app origin in production.
  app.use(
    cors({
      origin: env.clientUrl === '*' ? '*' : env.clientUrl,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
      credentials: env.clientUrl !== '*',
    })
  );

  // ── 3. Request context (AsyncLocalStorage) ──────────────────────────────
  // Must be before requestLogger so pino-http picks up x-request-id and
  // downstream code can retrieve the context via getRequestContext().
  app.use(requestContextMiddleware);

  // ── 4. Request logging ──────────────────────────────────────────────────
  app.use(requestLogger);

  // ── 5. Body parsers ─────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // ── 5b. NoSQL Injection sanitizer (strips $ and . from req.body, params, query) ─
  // Defense-in-depth per AGENT_RULES.md §19 — even if validators miss a field,
  // mongoSanitize strips Mongo operator keys before they reach a repository.
  app.use(mongoSanitize());

  // ── 6. Metrics collection (before routes, after parsers) ───────────────
  app.use(metricsMiddleware);

  // ── 7. Root-level health probes (before /api/v1 so load balancers can reach them)
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });
  app.get('/health/ready', (_req, res) => {
    if (isDatabaseConnected()) {
      res.status(200).json({ status: 'ready', database: 'connected' });
    } else {
      res.status(503).json({ status: 'not_ready', database: 'disconnected' });
    }
  });

  // ── 8. Routes (rate limiting is applied per feature route group) ────────
  app.use('/api/v1', router);

  // ── 9. Metrics endpoint (after routes, before 404) ─────────────────────
  app.get('/metrics', metricsHandler);

  // ── 10. 404 handler (after all routes) ───────────────────────────────────
  app.use(notFound);

  // ── 11. Centralized error handler (must be last, 4 arguments) ───────────
  app.use(errorHandler);

  return app;
}
