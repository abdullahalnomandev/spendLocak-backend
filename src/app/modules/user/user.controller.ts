import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      mobile,
      email,
      password,
      confirm_password,
      google_id_token,
      auth_provider,
      role,
      status,
      verified,
      permissions,
    } = req.body;

    const result = await UserService.createUserToDB({
      name,
      mobile,
      email,
      password,
      confirm_password,
      google_id_token,
      auth_provider,
      role,
      status,
      verified,
      permissions,
    });
    const responseData = auth_provider === 'local' ? undefined : result;
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message:
        auth_provider === 'local'
          ? 'User created successfully. Please verify your email.'
          : 'User created successfully',
      ...(responseData && { data: responseData }), // Only include data if not local
    });
  }
);

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data: any = {
      ...req.body,
    };

    if (image && image !== 'undefined') {
      data.image = image;
    }
    if(req.body.preference){
      data.preference = JSON.parse(req.body.preference);
    }

    console.log(data);

  

    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);



// Add getUserProfileById
const getUserProfileById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const requestUser = req.params?.id;

  const result = await UserService.getUserProfileByIdFromDB(
    userId,
    requestUser
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});


const getUserOverview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await UserService.getUserOverviewFromDB(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User overview retrieved successfully',
    data: result,
  });
});


const updateUserById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params?.id;
  const data = req.body;

  const result = await UserService.updateUserByIdToDB(userId, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteUserById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params?.id;
  const result = await UserService.deleteUserByIdFromDB(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User deleted successfully',
    data: result,
  });
});

const getAdminDashboardOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAdminDashboardOverview();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin dashboard overview retrieved successfully',
    data: result,
  });
});

const getAllAdminUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllAdminUsers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin users retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  getAllUsers,
  getUserProfileById,
  getUserOverview,
  updateUserById,
  deleteUserById,
  getAdminDashboardOverview,
  getAllAdminUsers
};