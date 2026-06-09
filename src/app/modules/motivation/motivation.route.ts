import express from 'express';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { USER_ROLES } from '../../../enums/user';
import { MotivationController } from './motivation.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  fileUploadHandler(),
  MotivationController.createMotivation
);

router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MotivationController.getAllMotivations
);

router.get(
  '/:id',
  MotivationController.getSingleMotivation
);

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  fileUploadHandler(),
  MotivationController.updateMotivation
);

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MotivationController.deleteMotivation
);

export const MotivationRoutes = router;
