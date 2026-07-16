import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import QueryBuilder from '../../builder/QueryBuilder';
import {
  USER_AUTH_PROVIDER,
  userSearchableField,
} from './user.constant';
import { IUser } from './user.interface';
import { User } from './user.model';
import { getUserInfoWithToken } from './user.util';
import generateOTP from '../../../util/generateOTP';
import { Motivation } from '../motivation/motivation.model';
import { Trigger } from '../trigger/trigger.model';
import { Rule } from '../rule/rule.model';
import { Package } from '../package/package.model';
import { CoinHistory } from '../coinHistory/coinHistory.model';
import { USER_ROLES } from '../../../enums/user';

const updateUserAccessFeature = async (userId: string) => {
  // This function can be used for future access control features
  // For now, just ensure the user is active
  await User.findByIdAndUpdate(userId, { status: 'active' });
};


const createUserToDB = async (
  payload: Partial<IUser>
): Promise<IUser | { accessToken: string }> => {
  if (!payload.password && !payload.google_id_token) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Password or Google ID token is required'
    );
  }

  let isValid = false;
  let authorization: { oneTimeCode: string; expireAt: Date } | null = null;

  //GOOGLE
  if (
    payload.auth_provider === USER_AUTH_PROVIDER.GOOGLE &&
    payload.google_id_token
  ) {
    const tokenData = await getUserInfoWithToken(payload?.google_id_token);
    payload.email = tokenData?.data?.email;
    payload.name = tokenData?.data?.name;
    isValid = true;
    if (tokenData) payload.verified = true;

    const isExist = await User.exists({ email: tokenData?.data?.email }).lean();
    await updateUserAccessFeature(isExist?._id as any);

    if (isExist) {
      const createToken = jwtHelper.createToken(
        { id: isExist._id, role: isExist.role, email: isExist.email },
        config.jwt.jwt_secret as Secret,
        config.jwt.jwt_expire_in as string
      );
      return { accessToken: createToken };
    }
  }
  //LOCAL
  else {
    if (payload.auth_provider === 'local' && payload.password) {
      isValid = true;

      if (!payload.verified) {
        const otp = generateOTP();
        authorization = {
          oneTimeCode: otp.toString(),
          expireAt: new Date(Date.now() + 3 * 60000),
        };
      }
    }
  }
  const createUser = await User.create(payload);

  if (!createUser || !isValid)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');

  if (isValid && createUser && payload.auth_provider === 'local' && !payload.verified) {
    if (!authorization?.oneTimeCode || !createUser?.email) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to generate OTP or missing email'
      );
    }
    const createAccountTemplate = emailTemplate.createAccount({
      otp: authorization.oneTimeCode,
      email: createUser.email,
    });
    emailHelper.sendEmail(createAccountTemplate);
    await User.findByIdAndUpdate(createUser._id, { $set: { authorization } });
    return createUser;
  } else {
    // Fix: 'isExist' is not defined in this scope. Use createUser instead.
    await updateUserAccessFeature(createUser._id as any);
    //create token
    const createToken = jwtHelper.createToken(
      { id: createUser._id, role: createUser.role, email: createUser.email },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string
    );
    return { accessToken: createToken };
  }
};

const getUserProfileFromDB = async (user: JwtPayload): Promise<any> => {

  const isExistUser = await User.findById(user.id).lean();

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Return user data
  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null> | undefined> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (payload.email) {
    delete payload.email;
  }

  if (payload.image === isExistUser.image) {
    unlinkFile(payload.image as string);
  }
  if(payload.preference?.motivation){
    const isValid = await Motivation.findById(payload.preference?.motivation).lean();
    if(!isValid){
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid motivation id');
    }
  }
  if(payload.preference?.trigger){
    const isValid = await Trigger.findById(payload.preference?.trigger).lean();
    if(!isValid){
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid trigger id');
    }
  }
  if(payload.preference){
    const preference = {
      ...isExistUser.preference,
      ...payload.preference,
    }
    payload.preference = preference;
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true }
  ).lean();

  if (updatedUser) {
    delete (updatedUser as any).authorization;
    delete (updatedUser as any).status;
  }

  return updatedUser;
};

const getAllUsers = async (query: Record<string, any>) => {
  // Build base query
  let baseQuery = User.find({role: USER_ROLES.USER});

  const userQuery = new QueryBuilder(baseQuery, query)
    .paginate()
    .search(userSearchableField)
    .fields()
    .filter(['club_id'])
    .sort();

  const result = await userQuery.modelQuery.lean();
  const pagination = await userQuery.getPaginationInfo();

  return {
    pagination,
    data: result,
  };
};

const getAllAdminUsers = async (query: Record<string, any>) => {
  // Build base query
  let baseQuery = User.find({role: {$ne: USER_ROLES.USER}});

  const userQuery = new QueryBuilder(baseQuery, query)
    .paginate()
    .search(userSearchableField)
    .fields()
    .filter()
    .sort();

  const result = await userQuery.modelQuery.lean();
  const pagination = await userQuery.getPaginationInfo();

  return {
    pagination,
    data: result,
  };
};
// .populate({
//   path: "airlineVerification",
//   match: { paymentStatus: "paid" },
//   select: "designation plan employeeId images paymentStatus paymentMethod",
//   populate: {
//     path: "plan",
//     select: "-active",
//   },

export const unfollowUser = async (userId: string, targetId: string) => {
  if (userId === targetId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot unfollow yourself');
  }

  // For now, this is a placeholder function
  // In a full implementation, you would need to add following/followers fields to the user model
  // or create a separate relationships model
  
  // Just verify both users exist
  const [user, target] = await Promise.all([
    User.findById(userId),
    User.findById(targetId)
  ]);

  if (!user || !target) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return { message: 'Unfollow functionality not yet implemented' };
};


const getUserProfileByIdFromDB = async (
  userId: string,
  requestUserId: string
): Promise<any> => {
  // Only unselect the arrays but still need to count their lengths, so will fetch their counts
  const isExistUser = await User.findById(
    requestUserId,
    '-status -role -authorization'
  )
    .lean();

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Return user data
  return isExistUser;
};



// DASHBOARD ANALYTICS
const getUserOverviewFromDB = async (userId: string) => {
  const isExistUser = await User.findById(userId).lean();
  if(!isExistUser){
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  // this month save balance
  // Update Rules and Date wise progress
  const isRuleActive = await Rule.findOne({active: true, user: userId, ruleType:"limit_based"}).lean();
  const saveBalance = isExistUser.preference?.budget - Number(isRuleActive?.reachedLimit || 100);
  return {
    currentStreak: isExistUser.currentStreak || 0,
    availableCoins: isExistUser.coinBalance || 0,
    saveBalancePerMonth: saveBalance,
  };
}

const updateUserByIdToDB = async (userId: string, payload: Partial<IUser>) => {
  const isExistUser = await User.findById(userId).lean();
  if(!isExistUser){
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return await User.findByIdAndUpdate(userId, { $set: payload }, { new: true }).lean();
}

const deleteUserByIdFromDB = async (userId: string) => {
  const isExistUser = await User.findById(userId).lean();
  if(!isExistUser){
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return await User.findByIdAndDelete(userId).lean();
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const getAdminDashboardOverview = async () => {
  const activeUsers = await User.find({ status: 'active' }).lean();
  const allPackages = await Package.find().lean();

  const packagePriceByCoins = new Map(
    allPackages.map(pkg => [pkg.coins, pkg.price || 0]),
  );

  const purchases = await CoinHistory.find({ type: 'BUY' }).lean();
  const totalRevenue = purchases.reduce(
    (acc, purchase) => acc + (packagePriceByCoins.get(purchase.coins) || 0),
    0,
  );

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const recentPurchases = await CoinHistory.find({
    type: 'BUY',
    createdAt: { $gte: startDate },
  }).lean();

  const revenueByMonth = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    revenueByMonth.set(`${date.getFullYear()}-${date.getMonth()}`, 0);
  }

  for (const purchase of recentPurchases) {
    const created = new Date(purchase.createdAt);
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    if (!revenueByMonth.has(key)) continue;

    const price = packagePriceByCoins.get(purchase.coins) || 0;
    revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + price);
  }

  const revinewGraph = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    revinewGraph.push({
      month: MONTH_LABELS[date.getMonth()],
      revenue: (revenueByMonth.get(key) || 0).toFixed(2),
    });
  }

  return {
    totalActiveUsers: activeUsers.length,
    totalRevenue: totalRevenue.toFixed(2),
    openTickets: 0,
    revinewGraph,
  };
}



export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getAllUsers,
  getUserProfileByIdFromDB,
  getUserOverviewFromDB,
  updateUserByIdToDB,
  deleteUserByIdFromDB,
  getAdminDashboardOverview,
  getAllAdminUsers,
}
