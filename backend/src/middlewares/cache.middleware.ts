import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet } from '../lib/redis';
import logger from '../lib/logger';

/**
 * Express middleware that caches GET responses in Redis.
 *
 * @param ttl  Time-to-live in seconds (default: 60)
 * @param keyFn  Optional function to customise the cache key based on the request.
 *               Defaults to `cache:<method>:<path>?<query>`.
 */
export function cacheMiddleware(
  ttl = 60,
  keyFn?: (req: Request) => string
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    const key = keyFn
      ? keyFn(req)
      : `cache:${req.method}:${req.path}:${JSON.stringify(req.query)}`;

    try {
      const cached = await cacheGet<unknown>(key);
      if (cached !== null) {
        logger.debug('Cache HIT', { key });
        res.setHeader('X-Cache', 'HIT');
        res.json(cached);
        return;
      }
    } catch {
      // Cache unavailable — fall through to handler
    }

    // Intercept res.json to populate the cache after the handler runs
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheSet(key, body, ttl).catch(() => undefined);
        res.setHeader('X-Cache', 'MISS');
      }
      return originalJson(body);
    };

    next();
  };
}
