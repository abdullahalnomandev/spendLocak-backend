import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { ITrigger } from './trigger.interface';
import { Trigger } from './trigger.model';
import { User } from '../user/user.model';

const createTriggerToDB = async (payload: Partial<ITrigger>): Promise<ITrigger> => {
  const result = await Trigger.create(payload);
  return result;
};

const getAllTriggersFromDB = async (
  query: Record<string, any>,
  userId?: string
) => {
  const triggerQuery = new QueryBuilder(Trigger.find(), query)
    .search(['title'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await triggerQuery.modelQuery.lean();
  const pagination = await triggerQuery.getPaginationInfo();

  let finalResult = result;
  if (userId) {
    const user = await User.findById(userId).lean();
    const preferredTriggerId = user?.preference?.trigger?.toString();

    finalResult = result.map((trigger: any) => ({
      ...trigger,
      preference: trigger._id.toString() === preferredTriggerId,
    }));
  }

  return {
    data: finalResult,
    pagination,
  };
};

const getSingleTriggerFromDB = async (id: string): Promise<ITrigger | null> => {
  const result = await Trigger.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Trigger not found');
  }
  return result;
};

const updateTriggerToDB = async (
  id: string,
  payload: Partial<ITrigger>
): Promise<ITrigger | null> => {
  const isExist = await Trigger.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Trigger not found');
  }

  const result = await Trigger.findOneAndUpdate(
    { _id: id },
    { $set: payload },
    { new: true, runValidators: true }
  );
  return result;
};

const deleteTriggerFromDB = async (id: string): Promise<ITrigger | null> => {
  const result = await Trigger.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Trigger not found');
  }
  return result;
};

export const TriggerService = {
  createTriggerToDB,
  getAllTriggersFromDB,
  getSingleTriggerFromDB,
  updateTriggerToDB,
  deleteTriggerFromDB,
};
