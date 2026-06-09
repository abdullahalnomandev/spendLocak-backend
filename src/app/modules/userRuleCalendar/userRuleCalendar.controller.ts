import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserRuleCalendarService } from './userRuleCalendar.service';

const createUserRuleCalendar = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    user: req.user.id,
  };
  const result = await UserRuleCalendarService.createUserRuleCalendarToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Calendar data created successfully',
    data: result,
  });
});

const getMyCalendarData = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const userId = req.user.id;
  const month = query.month as string;
  const year = query.year as string;
  const result = await UserRuleCalendarService.getMyCalendarDataFromDB(query, userId, month, year);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Calendar data retrieved successfully',
    data: result.data,
  });
});

const updateCalendarData = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserRuleCalendarService.updateCalendarDataToDB(id, req.user.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Calendar data updated successfully',
    data: result,
  });
});

export const UserRuleCalendarController = {
  createUserRuleCalendar,
  getMyCalendarData,
  updateCalendarData,
};
