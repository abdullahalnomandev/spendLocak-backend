import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IRule } from './rule.interface';
import { Rule } from './rule.model';

const createRuleToDB = async (payload: Partial<IRule>): Promise<IRule> => {
  if(payload.ruleType === "time_based"){
    payload.spending_limit = undefined;
  }
  if(payload.ruleType === "limit_based"){
    payload.startTime = undefined;
    payload.endTime = undefined;
    payload.activeDays = undefined;
  }
  const result = await Rule.create(payload);
  return result;
};

const getAllRulesFromDB = async (query: Record<string, any>, userId: string) => {
  const ruleQuery = new QueryBuilder(Rule.find({ user: userId }), query)
    .search(['ruleName', 'category'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await ruleQuery.modelQuery;
  const pagination = await ruleQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

const getSingleRuleFromDB = async (id: string, userId: string): Promise<IRule | null> => {
  let result = await Rule.findOne({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Rule not found');
  }
  // Convert Mongoose document to a plain JS object to safely add custom properties
  const ruleObject = result.toObject();
  if(ruleObject.ruleType === "limit_based"){
    ruleObject.isReachedLimit = Number(ruleObject.reachedLimit)  >= (Number(ruleObject.spending_limit) || 0);
  }
  return ruleObject;
};

const updateRuleToDB = async (
  id: string,
  userId: string,
  payload: Partial<IRule>
): Promise<IRule | null> => {
  const isExist = await Rule.findOne({ _id: id, user: userId });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Rule not found');
  }

  const result = await Rule.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: payload },
    { new: true, runValidators: true }
  );
  return result;
};

const deleteRuleFromDB = async (id: string, userId: string): Promise<IRule | null> => {
  const result = await Rule.findOneAndDelete({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Rule not found');
  }
  return result;
};

export const RuleService = {
  createRuleToDB,
  getAllRulesFromDB,
  getSingleRuleFromDB,
  updateRuleToDB,
  deleteRuleFromDB,
};
