import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PackageService } from './package.service';

const createPackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.createPackageToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Package created successfully',
    data: result,
  });
});

const getAllPackages = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const role = req.user.role;
  const result = await PackageService.getAllPackagesFromDB(query, role);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Packages retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getSinglePackage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PackageService.getSinglePackageFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package retrieved successfully',
    data: result,
  });
});

const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PackageService.updatePackageToDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package updated successfully',
    data: result,
  });
});

const deletePackage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PackageService.deletePackageFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package deleted successfully',
    data: result,
  });
});

const createCheckout = catchAsync(async (req: Request, res: Response) => {
  const origin = `${req.protocol}://${req.get('host')}`;
  const result = await PackageService.createCheckout(req.body,req.user?.id as string,origin);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Checkout created successfully',
    data: result.data,
  });
});
    // cancel_url: `${origin}/package/webhook?status=cancel&userId=${userId}&packageId=${packageExist._id}`,

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const status = req.query?.status as 'success' | 'cancel';
  const userId = req.query?.userId as string;
  const packageId = req.query?.packageId as string;
  await PackageService.updateOrderStatus(res,status,userId,packageId);


});


export const PackageController = {
  createPackage,
  getAllPackages,
  getSinglePackage,
  updatePackage,
  deletePackage,
  createCheckout,
  updateOrderStatus,
};
