import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PlaidService } from './plaid.service';

const createPlaidLink = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const result = await PlaidService.createPlaidLink(userId, fullUrl);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Plaid link created successfully',
    data: result,
  });
});

const setPlaidAccessToken = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { public_token } = req.body;
  await PlaidService.setPlaidAccessToken(userId, public_token);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Plaid access token set successfully',
  });
});

const webhook = catchAsync(async (req: Request, res: Response) => {
  await PlaidService.webhook(req.body);
  // request url
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Plaid webhook received successfully',
  });
});

export const PlaidController = {
  createPlaidLink,
  setPlaidAccessToken,
  webhook,
};
