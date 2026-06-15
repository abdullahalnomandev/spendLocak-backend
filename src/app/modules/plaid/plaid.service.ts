import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { logger } from '../../../shared/logger';
import { Rule } from '../rule/rule.model';

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
    products: ['transactions'],
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

const webhook = async (webhookData: any, userId: string) => {
  try {
    logger.info({ webhookData, userId });
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    const accessToken = user.plaid_access_token;

    if (!accessToken) {
      logger.error({
        message: 'Plaid access token not found',
      });
    }

    // Process only transaction sync webhooks
    if (webhookData?.webhook_type === 'TRANSACTIONS') {
      const response = await axios.post(
        `${config.plaid?.api_endpoint}/transactions/sync`,
        {
          client_id: config.plaid?.client_id,
          secret: config.plaid?.secret,
          access_token: accessToken,
        },
      );

      const {
        added = [],
        modified = [],
        removed = [],
        next_cursor,
      } = response.data;

      logger.info({
        added: added.length,
        modified: modified.length,
        removed: removed.length,
        next_cursor,
      });

      // Calculate total spending (Plaid: positive amount = money spent)
      const totalSpent = added
        .filter((transaction: any) => transaction.amount > 0)
        .reduce(
          (total: number, transaction: any) =>
            total + Number(transaction.amount),
          0,
        );

      logger.info({
        totalSpent,
        transactionsProcessed: added.length,
      });

      if (totalSpent > 0) {
        const updatedRule = await Rule.findOneAndUpdate(
          {
            user_id: userId,
            is_active: true,
          },
          {
            $inc: {
              reachedLimit: totalSpent,
            },
          },
          {
            new: true,
          },
        );

        logger.info({
          ruleId: updatedRule?._id,
          totalSpent,
          message: 'Rule spending limit updated',
        });
      }
    }
  } catch (error: any) {
    logger.error({
      message: 'Plaid webhook processing failed',
      error: error?.response?.data || error?.message || error,
    });

    throw error;
  }
};
export const PlaidService = {
  createPlaidLink,
  setPlaidAccessToken,
  webhook,
};
