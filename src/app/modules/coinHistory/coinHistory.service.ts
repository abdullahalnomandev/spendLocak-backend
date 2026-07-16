import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { ICoinHistory } from './coinHistory.interface';
import { CoinHistory } from './coinHistory.model';
import { User } from '../user/user.model';
import { UserRuleCalendar } from '../userRuleCalendar/userRuleCalendar.model';
import { Package } from '../package/package.model';
import dayjs from 'dayjs';

type RevenueTier = 'starter' | 'standard' | 'premium';

const tierForAmount = (amount: number): RevenueTier => {
  if (amount < 100) return 'starter';
  if (amount < 180) return 'standard';
  return 'premium';
};

const createCoinHistoryToDB = async (
  payload: Partial<ICoinHistory>,
): Promise<ICoinHistory> => {
  const result = await CoinHistory.create(payload);
  return result;
};

const getMyCoinHistoryFromDB = async (
  query: Record<string, any>,
  userId: string,
) => {
  const coinHistoryQuery = new QueryBuilder(
    CoinHistory.find({ user: userId }),
    query,
  )
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await coinHistoryQuery.modelQuery;
  const pagination = await coinHistoryQuery.getPaginationInfo();
  return {
    data: result,
    pagination,
  };
};

const getSingleCoinHistoryFromDB = async (
  id: string,
  userId: string,
): Promise<ICoinHistory | null> => {
  const result = await CoinHistory.findOne({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Coin history not found');
  }
  return result;
};

const useCoinFromDB = async (userId: string): Promise<void> => {
  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      coinBalance: { $gt: 0 },
    },
    {
      $inc: { coinBalance: -1 },
      $set: { currentStreak: 0 },
    },
    {
      new: true,
    },
  );

  if (!user) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'User not found or has no coins',
    );
  }

  const today = dayjs().format('YYYY-MM-DD');

  const exists = await UserRuleCalendar.exists({
    user: user._id,
    status: 'break',
    date: today,
  });

  const promises: Promise<unknown>[] = [
    CoinHistory.create({
      user: userId,
      title: 'Coin used',
      description: 'You used a coin to unlock the app',
      type: 'SPEND',
      coins: -1,
    }),
  ];

  if (!exists) {
    promises.push(
      UserRuleCalendar.create({
        user: user._id,
        date: today,
        status: 'break',
      }),
    );
  }

  await Promise.all(promises);
};

const getRevenueReportFromDB = async () => {
  const [purchases, packages] = await Promise.all([
    CoinHistory.find({ type: 'BUY' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean(),
    Package.find().lean(),
  ]);

  const packageByCoins = new Map(packages.map(pkg => [pkg.coins, pkg]));

  const events = purchases.map(purchase => {
    const pkg = packageByCoins.get(purchase.coins);
    const amount = pkg?.price || 0;
    const user = purchase.user as { _id?: string; name?: string } | string;

    return {
      id: String(purchase._id),
      customerId: typeof user === 'object' ? String(user?._id) : String(user),
      customerName:
        typeof user === 'object' ? user?.name || 'Unknown' : 'Unknown',
      amount,
      coins: purchase.coins,
      tier: tierForAmount(amount),
      packageId: pkg?._id ? String(pkg._id) : undefined,
      packageLabel:
        purchase.description ||
        (pkg ? `${pkg.coins} Coins Package` : 'Custom'),
      occurredAt: purchase.createdAt,
    };
  });

  return { events };
};

export const CoinHistoryService = {
  createCoinHistoryToDB,
  getMyCoinHistoryFromDB,
  getSingleCoinHistoryFromDB,
  useCoinFromDB,
  getRevenueReportFromDB,
};
