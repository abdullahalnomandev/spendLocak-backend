import express from 'express';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { USER_ROLES } from '../../../enums/user';
import { TriggerController } from './trigger.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  fileUploadHandler(),
  TriggerController.createTrigger
);

router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  TriggerController.getAllTriggers
);

router.get(
  '/:id',
  TriggerController.getSingleTrigger
);

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  fileUploadHandler(),
  TriggerController.updateTrigger
);

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  TriggerController.deleteTrigger
);

export const TriggerRoutes = router;
