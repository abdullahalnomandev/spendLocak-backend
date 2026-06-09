import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CoinHistoryService } from './coinHistory.service';

const createCoinHistory = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    user: req.user.id,
  };
  const result = await CoinHistoryService.createCoinHistoryToDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Coin history created successfully',
    data: result,
  });
});

const getMyCoinHistory = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await CoinHistoryService.getMyCoinHistoryFromDB(
    query,
    req.user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Coin history retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getSingleCoinHistory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CoinHistoryService.getSingleCoinHistoryFromDB(
    id,
    req.user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Coin history retrieved successfully',
    data: result,
  });
});

export const CoinHistoryController = {
  createCoinHistory,
  getMyCoinHistory,
  getSingleCoinHistory,
};
