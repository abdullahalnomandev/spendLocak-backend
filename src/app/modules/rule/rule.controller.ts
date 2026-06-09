import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { RuleService } from './rule.service';

const createRule = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    user: req.user.id,
  };

  const result = await RuleService.createRuleToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Rule created successfully',
    data: result,
  });
});

const getAllRules = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await RuleService.getAllRulesFromDB(query, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Rules retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getSingleRule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RuleService.getSingleRuleFromDB(id, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Rule retrieved successfully',
    data: result,
  });
});

const updateRule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RuleService.updateRuleToDB(id, req.user.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Rule updated successfully',
    data: result,
  });
});

const deleteRule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RuleService.deleteRuleFromDB(id, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Rule deleted successfully',
    data: result,
  });
});

export const RuleController = {
  createRule,
  getAllRules,
  getSingleRule,
  updateRule,
  deleteRule,
};
