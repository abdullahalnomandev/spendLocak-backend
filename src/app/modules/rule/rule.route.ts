import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { RuleController } from './rule.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  RuleController.createRule
);

router.get(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  RuleController.getAllRules
);

router.get(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  RuleController.getSingleRule
);

router.patch(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  RuleController.updateRule
);

router.delete(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  RuleController.deleteRule
);

export const RuleRoutes = router;
