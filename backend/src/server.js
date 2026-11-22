import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { startReservationExpiryJob } from './jobs/reservationExpiry.job.js';
import { cache } from './config/redis.js';

await connectDB();
const expiryJob = startReservationExpiryJob();
const server = app.listen(env.PORT, () => logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Evaan Earth API listening'));
async function shutdown(signal) {
  logger.info({ signal }, 'Shutting down'); expiryJob.stop(); server.close(async () => { await cache.close(); process.exit(0); });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM')); process.on('SIGINT', () => shutdown('SIGINT'));
