import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { PackageController } from './package.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  PackageController.createPackage
);

router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  PackageController.getAllPackages
);
router.get('/webhook',PackageController.updateOrderStatus);

router.get(
  '/:id',
  PackageController.getSinglePackage
);

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  PackageController.updatePackage
);

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  PackageController.deletePackage
);


router.post('/create-checkout',auth(USER_ROLES.ADMIN,USER_ROLES.USER,USER_ROLES.SUPER_ADMIN),PackageController.createCheckout)


export const PackageRoutes = router;
