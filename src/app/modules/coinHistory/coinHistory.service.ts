import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { ICoinHistory } from './coinHistory.interface';
import { CoinHistory } from './coinHistory.model';
import { User } from '../user/user.model';

const createCoinHistoryToDB = async (payload: Partial<ICoinHistory>): Promise<ICoinHistory> => {
  const result = await CoinHistory.create(payload);
  return result;
};

const getMyCoinHistoryFromDB = async (query: Record<string, any>, userId: string) => {
  const coinHistoryQuery = new QueryBuilder(CoinHistory.find({ user: userId }), query)
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await coinHistoryQuery.modelQuery;
  const pagination = await coinHistoryQuery.getPaginationInfo();
  return {
    data: result,
    pagination
  };
};

const getSingleCoinHistoryFromDB = async (id: string, userId: string): Promise<ICoinHistory | null> => {
  const result = await CoinHistory.findOne({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Coin history not found');
  }
  return result;
};

export const CoinHistoryService = {
  createCoinHistoryToDB,
  getMyCoinHistoryFromDB,
  getSingleCoinHistoryFromDB,
};
