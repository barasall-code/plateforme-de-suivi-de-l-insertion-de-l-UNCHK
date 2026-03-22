import Redis from 'ioredis';
import logger from './logger';

let redisClient: Redis | null = null;

/**
 * Returns a Redis client if REDIS_URL is configured, otherwise null.
 * When null, callers should fall through to the database.
 */
function getRedisClient(): Redis | null {
  if (redisClient !== null) return redisClient;

  const url = process.env.REDIS_URL;
  if (!url) {
    logger.debug('Redis: REDIS_URL non configuré — cache désactivé');
    return null;
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    lazyConnect: true,
    enableReadyCheck: false,
  });

  client.on('connect', () => logger.info('Redis: connexion établie'));
  client.on('error', (err) => logger.warn('Redis: erreur de connexion', { message: err.message }));

  redisClient = client;
  return client;
}

/** Get a cached JSON value. Returns null on miss or Redis unavailable. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;
  try {
    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (err) {
    logger.warn('Redis cacheGet error', { key, message: (err as Error).message });
    return null;
  }
}

/** Set a JSON value in cache. Silently fails when Redis is unavailable. */
export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    logger.warn('Redis cacheSet error', { key, message: (err as Error).message });
  }
}

/** Invalidate one or more cache keys (supports glob patterns via SCAN+DEL). */
export async function cacheInvalidate(...patterns: string[]): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        // Use SCAN to safely delete matching keys
        let cursor = '0';
        do {
          const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
          cursor = nextCursor;
          if (keys.length > 0) await client.del(...keys);
        } while (cursor !== '0');
      } else {
        await client.del(pattern);
      }
    }
  } catch (err) {
    logger.warn('Redis cacheInvalidate error', { patterns, message: (err as Error).message });
  }
}

export default getRedisClient;
