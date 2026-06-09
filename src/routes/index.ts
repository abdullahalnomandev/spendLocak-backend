import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { MotivationRoutes } from '../app/modules/motivation/motivation.route';
import { TriggerRoutes } from '../app/modules/trigger/trigger.route';
import { RuleRoutes } from '../app/modules/rule/rule.route';
import { PackageRoutes } from '../app/modules/package/package.route';
import { CoinHistoryRoutes } from '../app/modules/coinHistory/coinHistory.route';
import { UserRuleCalendarRoutes } from '../app/modules/userRuleCalendar/userRuleCalendar.route';

const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/notification',
    route: NotificationRoutes
  },
  {
    path: '/motivation',
    route: MotivationRoutes
  },
  {
    path: '/trigger',
    route: TriggerRoutes
  },
  {
    path: '/rule',
    route: RuleRoutes
  },
  {
    path: '/package',
    route: PackageRoutes
  },
  {
    path: '/coin-history',
    route: CoinHistoryRoutes
  },
  {
    path: '/calendar',
    route: UserRuleCalendarRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
