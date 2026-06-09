import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { IMotivation } from './motivation.interface';
import { Motivation } from './motivation.model';

const createMotivationToDB = async (payload: Partial<IMotivation>): Promise<IMotivation> => {
  const result = await Motivation.create(payload);
  return result;
};

const getAllMotivationsFromDB = async (
  query: Record<string, any>,
  userId?: string
) => {
  const motivationQuery = new QueryBuilder(Motivation.find(), query)
    .search(['title'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await motivationQuery.modelQuery.lean();
  const pagination = await motivationQuery.getPaginationInfo();

  let finalResult = result;
  if (userId) {
    const user = await User.findById(userId).lean();
    const preferredMotivationId = user?.preference?.motivation?.toString();

    finalResult = result.map((motivation: any) => ({
      ...motivation,
      preference: motivation._id.toString() === preferredMotivationId,
    }));
  }

  return {
    data: finalResult,
    pagination,
  };
};

const getSingleMotivationFromDB = async (id: string): Promise<IMotivation | null> => {
  const result = await Motivation.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Motivation not found');
  }
  return result;
};

const updateMotivationToDB = async (
  id: string,
  payload: Partial<IMotivation>
): Promise<IMotivation | null> => {
  const isExist = await Motivation.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Motivation not found');
  }

  const result = await Motivation.findOneAndUpdate(
    { _id: id },
    { $set: payload },
    { new: true, runValidators: true }
  );
  return result;
};

const deleteMotivationFromDB = async (id: string): Promise<IMotivation | null> => {
  const result = await Motivation.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Motivation not found');
  }
  return result;
};

export const MotivationService = {
  createMotivationToDB,
  getAllMotivationsFromDB,
  getSingleMotivationFromDB,
  updateMotivationToDB,
  deleteMotivationFromDB,
};
