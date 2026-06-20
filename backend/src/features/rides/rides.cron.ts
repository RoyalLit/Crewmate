import cron from 'node-cron';

import { RIDE } from '../../config/constants';
import { RideModel } from '../../db/models/Ride';
import logger from '../../shared/logger';

export function startRideExpiryCron(): void {
  cron.schedule(RIDE.EXPIRY_CRON, async () => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const time = now.toISOString().split('T')[1].slice(0, 5);

      const result = await RideModel.updateMany(
        {
          status: { $in: ['active', 'full'] },
          $or: [
            { departureDate: { $lt: today } },
            {
              departureDate: today,
              departureTime: { $lte: time },
            },
          ],
        },
        { $set: { status: 'expired' } }
      );

      if (result.modifiedCount > 0) {
        logger.info({ modifiedCount: result.modifiedCount }, 'Ride expiry cron: expired rides');
      }
    } catch (error) {
      logger.error({ err: error }, 'Ride expiry cron job failed');
    }
  });

  logger.info({ cron: RIDE.EXPIRY_CRON }, 'Ride expiry cron job scheduled');
}
