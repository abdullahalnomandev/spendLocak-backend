import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { ICoinHistory } from './coinHistory.interface';
import { CoinHistory } from './coinHistory.model';
import { User } from '../user/user.model';
import { UserRuleCalendar } from '../userRuleCalendar/userRuleCalendar.model';
import dayjs from 'dayjs';

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
export const CoinHistoryService = {
  createCoinHistoryToDB,
  getMyCoinHistoryFromDB,
  getSingleCoinHistoryFromDB,
  useCoinFromDB,
};
