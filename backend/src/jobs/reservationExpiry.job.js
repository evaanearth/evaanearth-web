import cron from 'node-cron';
import { Order } from '../models/Order.js';
import { releaseReservation } from '../services/inventory.service.js';
import { logger } from '../config/logger.js';
export function startReservationExpiryJob() {
  return cron.schedule('* * * * *', async () => {
    try {
      const expired = await Order.find({ status: 'payment_pending', reservationState: 'active', reservationExpiresAt: { $lte: new Date() } }).select('_id').limit(200).lean();
      for (const order of expired) await releaseReservation(order._id, 'Five-minute payment reservation expired');
      if (expired.length) logger.info({ count: expired.length }, 'Expired payment reservations processed');
    } catch (error) { logger.error({ err: error }, 'Reservation expiry job failed'); }
  }, { scheduled: true });
}
