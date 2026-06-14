import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';

const createPlaidLink = async (
  userId: string,
  fullUrl: string,
): Promise<{ link_token: string }> => {
  const isExist = await User.findById(userId);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const payload = {
    client_id: config.plaid?.client_id,
    secret: config.plaid?.secret,
    user: {
      client_user_id: userId,
    },
    webhook: fullUrl,
    client_name: isExist.name,
    products: ['auth'],
    language: 'en',
    country_codes: ['US'],
  };

  try {
    const axiosResponse = await axios.post(
      `${config.plaid?.api_endpoint}/link/token/create`,
      payload,
    );
    return axiosResponse.data;
  } catch (error: any) {
    console.error('Plaid API error:', error.response?.data);
    throw new ApiError(
      error.response?.status || StatusCodes.BAD_REQUEST,
      error.response?.data?.error_message ||
        'Failed to create Plaid link token',
    );
  }
};

const setPlaidAccessToken = async (
  userId: string,
  public_token: string,
): Promise<void> => {
  const isExist = await User.findById(userId);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  try {
    const axiosResponse = await axios.post(
      `${config.plaid?.api_endpoint}/item/public_token/exchange`,
      {
        client_id: config.plaid?.client_id,
        secret: config.plaid?.secret,
        public_token: public_token,
      },
    );
    console.log(axiosResponse.data);
    isExist.plaid_access_token = axiosResponse?.data?.access_token || '';
    await isExist.save();
  } catch (error: any) {
    console.error('Plaid API error:', error.response?.data);
    throw new ApiError(
      error.response?.status || StatusCodes.BAD_REQUEST,
      error.response?.data?.error_message ||
        'Failed to exchange public token for access token',
    );
  }
};

const webhook = async (webhookData: any) => {
  console.log({ webhookData });
};
export const PlaidService = {
  createPlaidLink,
  setPlaidAccessToken,
  webhook,
};
