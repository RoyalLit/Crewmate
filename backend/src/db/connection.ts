/**
 * MongoDB connection management via Mongoose.
 *
 * connectDB()    — establishes the connection, logs result, registers event handlers.
 * disconnectDB() — graceful disconnect used in tests and shutdown handlers.
 *
 * Signal handlers (SIGTERM, SIGINT) are registered here to ensure graceful
 * shutdown — the server stops accepting requests before closing the DB connection.
 *
 * Per AGENT_RULES.md §21.1: "Application startup logs the loaded configuration
 * (without secrets) and confirms external service connectivity."
 */

import mongoose from 'mongoose';

import env from '../config/env';
import logger from '../shared/logger';

const SLOW_QUERY_THRESHOLD = 100;

mongoose.plugin(function slowQueryPlugin(schema: any) {
  const operations = ['find', 'findOne', 'countDocuments', 'updateOne', 'deleteOne', 'findOneAndUpdate', 'findOneAndDelete'];
  operations.forEach((op) => {
    schema.pre(op, function (this: any) {
      this._startTime = Date.now();
    });
    schema.post(op, function (this: any) {
      const duration = Date.now() - this._startTime;
      if (duration > SLOW_QUERY_THRESHOLD) {
        logger.warn(
          { collection: this.mongooseCollection?.name, operation: op, duration, query: this.getQuery() },
          'Slow database query'
        );
      }
    });
  });
});

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) {
    logger.warn('connectDB called but MongoDB is already connected — skipping.');
    return;
  }

  try {
    await mongoose.connect(env.mongoUri, {
      // Mongoose 8.x defaults are sensible; no poolSize override needed for MVP
    });

    isConnected = true;
    logger.info(
      {
        // Log database name but never the full URI (contains credentials)
        database: mongoose.connection.name,
        host: mongoose.connection.host,
      },
      'MongoDB connected successfully'
    );
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failed');
    // Re-throw so the server entry point can decide whether to exit
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected');
}

export function isDatabaseConnected(): boolean {
  // mongoose.connection.readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  return mongoose.connection.readyState === mongoose.STATES.connected;
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
// Register once. Guards against duplicate handler registration in hot-reload.
let shutdownHandlersRegistered = false;

let httpServerRef: { close: (cb?: (err?: Error) => void) => void } | null = null;

export function setHttpServer(server: { close: (cb?: (err?: Error) => void) => void }): void {
  httpServerRef = server;
}

export function registerShutdownHandlers(): void {
  if (shutdownHandlersRegistered) return;
  shutdownHandlersRegistered = true;

  async function shutdown(signal: string): Promise<void> {
    logger.info({ signal }, 'Shutdown signal received — draining HTTP connections');

    if (httpServerRef) {
      await new Promise<void>((resolve) => {
        httpServerRef!.close((err) => {
          if (err) {
            logger.error({ err }, 'Error closing HTTP server');
          }
          resolve();
        });
      });
    }

    await disconnectDB();
    process.exit(0);
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

// ── Mongoose connection event logging ────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error({ err }, 'MongoDB connection error');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  logger.info('MongoDB reconnected');
});
