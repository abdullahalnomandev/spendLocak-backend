import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { UserRuleCalendarController } from './userRuleCalendar.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserRuleCalendarController.createUserRuleCalendar
);

router.get(
  '/streak',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserRuleCalendarController.getMyCalendarData
);

router.patch(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserRuleCalendarController.updateCalendarData
);



export const UserRuleCalendarRoutes = router;
