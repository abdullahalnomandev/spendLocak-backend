import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MotivationService } from './motivation.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createMotivation = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files as any, 'image');
  const payload = {
    ...req.body,
    image: image || req.body.image,
  };

  const result = await MotivationService.createMotivationToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Motivation created successfully',
    data: result,
  });
});

const getAllMotivations = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await MotivationService.getAllMotivationsFromDB(query, req.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Motivations retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getSingleMotivation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MotivationService.getSingleMotivationFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Motivation retrieved successfully',
    data: result,
  });
});

const updateMotivation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const image = getSingleFilePath(req.files as any, 'image');
  const payload = {
    ...req.body,
    image: image || req.body.image,
  };

  const result = await MotivationService.updateMotivationToDB(id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Motivation updated successfully',
    data: result,
  });
});

const deleteMotivation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MotivationService.deleteMotivationFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Motivation deleted successfully',
    data: result,
  });
});

export const MotivationController = {
  createMotivation,
  getAllMotivations,
  getSingleMotivation,
  updateMotivation,
  deleteMotivation,
};
