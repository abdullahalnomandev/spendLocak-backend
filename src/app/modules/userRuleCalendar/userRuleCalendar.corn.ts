import { logger } from '../../../shared/logger';
import setCronJob from '../../../shared/setCronJob';
import { UserRuleCalendarService } from './userRuleCalendar.service';

let cronJobInitialized = false;

const dailyUserRuleCalendarUpdate = () => {
  if (cronJobInitialized) return;

  cronJobInitialized = true;

  // Every day at 11:59 AM
  setCronJob(
    '* * * * *', // '59 11 * * *',
    async () => {
      try {
        logger.info('🕐 Running daily user rule calendar update cron job');
        await UserRuleCalendarService.updateUserRuleCalendarData();
        logger.info('✅ Daily user rule calendar update completed');
      } catch (error) {
        logger.error('❌ Daily user rule calendar update failed:', error);
      }
    },
    false,
  );
};

export { dailyUserRuleCalendarUpdate };
