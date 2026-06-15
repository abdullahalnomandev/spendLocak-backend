import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PlaidService } from './plaid.service';

const createPlaidLink = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  // const fullUrl = `${req.protocol}://${req.get('host')}/api/v1/plaid/webhook?userId=${userId}`;
  const fullUrl = "https://webhook.site/f47cff30-0db4-40da-a32a-906debfdfa88?userId="+userId;
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
  const userId = req.query.userId as string;
  const webhookData = req.body;
  await PlaidService.webhook(webhookData, userId);
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
