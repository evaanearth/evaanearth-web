import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

let redis = null;
if (env.REDIS_URL) {
  redis = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1, enableReadyCheck: true });
  redis.connect().catch((error) => logger.warn({ err: error }, 'Redis unavailable; cache disabled'));
  redis.on('error', (error) => logger.warn({ err: error }, 'Redis error'));
}
export const cache = {
  async get(key) {
    if (!redis || redis.status !== 'ready') return null;
    try { const value = await redis.get(key); return value ? JSON.parse(value) : null; } catch { return null; }
  },
  async set(key, value, ttl = 30) {
    if (!redis || redis.status !== 'ready') return;
    try { await redis.set(key, JSON.stringify(value), 'EX', ttl); } catch (error) { logger.warn({ err: error }, 'Cache write failed'); }
  },
  async delByPrefix(prefix) {
    if (!redis || redis.status !== 'ready') return;
    try { const keys = await redis.keys(`${prefix}*`); if (keys.length) await redis.del(...keys); } catch (error) { logger.warn({ err: error }, 'Cache invalidation failed'); }
  },
  async close() { if (redis) await redis.quit().catch(() => {}); }
};
