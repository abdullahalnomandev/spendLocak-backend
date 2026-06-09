import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import { USER_ROLES } from '../../../enums/user';
import stripe from '../../../config/stripe';
import { User } from '../user/user.model';
import { Notification } from '../notification/notification.mode';
import config from '../../../config';
import { CoinHistory } from '../coinHistory/coinHistory.model';

const createPackageToDB = async (
  payload: Partial<IPackage>,
): Promise<IPackage> => {
  const result = await Package.create(payload);
  return result;
};

const getAllPackagesFromDB = async (
  query: Record<string, any>,
  role: USER_ROLES,
) => {
  if (role === USER_ROLES.USER) {
    query.isActive = true;
  }
  query.sort = 'coins';
  const packageQuery = new QueryBuilder(Package.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await packageQuery.modelQuery;
  const pagination = await packageQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

const getSinglePackageFromDB = async (id: string): Promise<IPackage | null> => {
  const result = await Package.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }
  return result;
};

const updatePackageToDB = async (
  id: string,
  payload: Partial<IPackage>,
): Promise<IPackage | null> => {
  const isExist = await Package.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }

  const result = await Package.findOneAndUpdate(
    { _id: id },
    { $set: payload },
    { new: true, runValidators: true },
  );
  return result;
};

const deletePackageFromDB = async (id: string): Promise<IPackage | null> => {
  const result = await Package.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }
  return result;
};

const createCheckout = async (
  payload: Partial<{ packageId: string }>,
  userId: string,
  origin: string,
) => {
  if (!payload.packageId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'packageId is required');
  }

  const packageExist = await Package.findById(payload.packageId);
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (!packageExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }

  if (!packageExist.isActive) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Package is not active');
  }

  // Stripe line item
  const stripeLineItems = [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${packageExist.coins} Coins Package`,
          description: `Get ${packageExist.coins} coins`,
        },
        unit_amount: Math.round(packageExist.price * 100), // cents
      },
      quantity: 1,
    },
  ];

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: isUserExist.email,

    line_items: stripeLineItems,

    success_url: `${origin}/api/v1/package/webhook?status=success&userId=${userId}&packageId=${packageExist._id}`,
    cancel_url: `${origin}/api/v1/package/webhook?status=cancel&userId=${userId}&packageId=${packageExist._id}`,
  });

  return {
    data: {
      paymentUrl: checkoutSession.url ?? '',
    },
  };
};

const updateOrderStatus = async (
  res: Response | any,
  status: 'success' | 'cancel',
  userId: string,
  packageId: string,
) => {
  const packageExist = await Package.findById(packageId);
  if (!packageExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }

  if (status === 'success') {
    // Create notification for user
    await Notification.create({
      receiver: userId,
      title: 'Purchase Success',
      message: `Thank you for your purchase! Your order is confirmed and you have received ${packageExist.coins} coins.`,
      refId: userId,
      path: `/package-history/${packageId}`,
    });

    await CoinHistory.create({
      user: userId,
      title: 'Bought coins',
      description: `Purchase ${packageExist.coins} Coins Package`,
      coins: packageExist.coins,
      type: 'BUY',
    });

    await User.updateOne(
      { _id: userId },
      { $inc: { coinBalance: packageExist.coins } },
      { upsert: true },
    );
    return res.redirect(
      `${config.front_end_app_url}?screen=package_success&packageId=${packageId}&userId=${userId}`,
      // `${config.front_end_app_url}/success?packageId=${packageId}&userId=${userId}`
    );
  }

  if (status === 'cancel') {
    // Create notification for user
    await Notification.create({
      receiver: userId,
      title: 'Purchase Canceled',
      message:
        'We are sorry to hear that you have canceled your purchase. We hope you will consider us again.',
      refId: userId,
      path: `/package-history/${packageId}`,
    });

    return res.redirect(
      `${config.front_end_app_url}?screen=package_cancel&packageId=${packageId}&userId=${userId}`,
      // `${config.front_end_app_url}/cancel?packageId=${packageId}&userId=${userId}`
    );
  }
};

export const PackageService = {
  createPackageToDB,
  getAllPackagesFromDB,
  getSinglePackageFromDB,
  updatePackageToDB,
  deletePackageFromDB,
  createCheckout,
  updateOrderStatus,
};
