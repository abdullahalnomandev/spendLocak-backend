import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TriggerService } from './trigger.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createTrigger = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files as any, 'image');
  const payload = {
    ...req.body,
    image: image || req.body.image,
  };

  const result = await TriggerService.createTriggerToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Trigger created successfully',
    data: result,
  });
});

const getAllTriggers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await TriggerService.getAllTriggersFromDB(query, req.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Triggers retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getSingleTrigger = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TriggerService.getSingleTriggerFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Trigger retrieved successfully',
    data: result,
  });
});

const updateTrigger = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const image = getSingleFilePath(req.files as any, 'image');
  const payload = {
    ...req.body,
    image: image || req.body.image,
  };

  const result = await TriggerService.updateTriggerToDB(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Trigger updated successfully',
    data: result,
  });
});

const deleteTrigger = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TriggerService.deleteTriggerFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Trigger deleted successfully',
    data: result,
  });
});

export const TriggerController = {
  createTrigger,
  getAllTriggers,
  getSingleTrigger,
  updateTrigger,
  deleteTrigger,
};
