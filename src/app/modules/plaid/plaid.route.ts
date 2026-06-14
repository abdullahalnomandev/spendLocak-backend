import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { PlaidController } from './plaid.controller';

const router = express.Router();

router.post(
  '/link/create',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  PlaidController.createPlaidLink
);

router.post(
  '/set_access_token',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  PlaidController.setPlaidAccessToken
);

router.post('/webhook', PlaidController.webhook);

export const PlaidRoutes = router;
