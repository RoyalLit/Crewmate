import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

import type { Request, Response, NextFunction } from 'express';

export interface RequestContext {
  requestId: string;
  userId?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

export function requestContextMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  const context: RequestContext = { requestId };

  if ((req as any).user?.userId) {
    context.userId = (req as any).user.userId;
  }

  req.headers['x-request-id'] = requestId;

  asyncLocalStorage.run(context, () => {
    next();
  });
}
