import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IUserRuleCalendar } from './userRuleCalendar.interface';
import { UserRuleCalendar } from './userRuleCalendar.model';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { Rule } from '../rule/rule.model';
import dayjs from 'dayjs';
import { CoinHistory } from '../coinHistory/coinHistory.model';
import { Notification } from '../notification/notification.mode';
import admin from '../../../helpers/firebaseConfig';

const createUserRuleCalendarToDB = async (
  payload: Partial<IUserRuleCalendar>,
): Promise<IUserRuleCalendar> => {
  const result = await UserRuleCalendar.create(payload);
  return result;
};

const getMyCalendarDataFromDB = async (
  query: Record<string, any>,
  userId: string,
  month?: string,
  year?: string,
): Promise<{ data: IUserRuleCalendar[] }> => {
  const now = dayjs();

  // 🧠 default = current month/year
  const finalYear = year ? Number(year) : now.year();
  const finalMonth = month ? Number(month) : now.month() + 1;

  // optional: for validation/debug
  const startOfMonth = dayjs(`${finalYear}-${finalMonth}-01`);

  console.log('Year:', finalYear);
  console.log('Month:', finalMonth);

  const result = await UserRuleCalendar.find({
    user: userId,
    date: {
      $gte: startOfMonth.startOf('month').format('YYYY-MM-DD'),
      $lte: startOfMonth.endOf('month').format('YYYY-MM-DD'),
    },
  });

  return {
    data: result,
  };
};

const updateCalendarDataToDB = async (
  id: string,
  userId: string,
  payload: Partial<IUserRuleCalendar>,
): Promise<IUserRuleCalendar | null> => {
  const isExist = await UserRuleCalendar.findOne({ _id: id, user: userId });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Calendar data not found');
  }

  const result = await UserRuleCalendar.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: payload },
    { new: true, runValidators: true },
  );
  return result;
};

const updateUserRuleCalendarData = async () => {
  const today = dayjs().format('YYYY-MM-DD');

  const users = await User.find({ role: USER_ROLES.USER });

  for (const user of users) {
    const hasActiveRule = await Rule.exists({
      user: user._id,
      active: true,
    });

    if (!hasActiveRule) continue;

    const exists = await UserRuleCalendar.exists({
      user: user._id,
      date: today,
    });

    if (exists) continue;

    // =========================
    // CREATE TODAY ENTRY
    // =========================
    await UserRuleCalendar.create({
      user: user._id,
      date: today,
      status: 'progress',
    });

    // =========================
    // GET LAST 5 DAYS
    // =========================
    const last5Days = await UserRuleCalendar.find({
      user: user._id,
      date: {
        $gte: dayjs().subtract(4, 'day').format('YYYY-MM-DD'),
        $lte: today,
      },
    });

    const isFull5Progress =
      last5Days.length === 5 && last5Days.every(d => d.status === 'progress');

    // =========================
    // UPDATE STREAK
    // =========================
    const userDoc = await User.findById(user._id);

    let newStreak = (userDoc?.currentStreak || 0) + 1;

    await User.updateOne(
      { _id: user._id },
      { $set: { currentStreak: newStreak } },
    );

    // =========================
    // COIN LOGIC (IMPORTANT FIX)
    // =========================
    if (isFull5Progress) {
      await User.updateOne({ _id: user._id }, { $inc: { coinBalance: 1 } });
      await CoinHistory.create({
        user: user._id,
        title: '5-day streak bonus',
        description: `You earned 1 coin for completing 5 days in a row.`,
        coins: 1,
        type: 'EARN',
      });
      //  =========================
      //  CREATE NOTIFICATION
      //  =========================
      Notification.create({
        receiver: user._id,
        title: '5-day streak bonus',
        message: `You earned 1 coin for completing 5 days in a row.`,
        refId: user._id,
        path: `/user-rule-calendar/${user._id}`,
      });
      //  =========================
      //  SEND PUSH NOTIFICATION
      //  =========================
      if (user?.fcmToken && user?.enable_notification) {
        admin.messaging().send({
          token: user.fcmToken!,
          notification: {
            title: '5-day streak bonus',
            body: `You earned 1 coin for completing 5 days in a row.`,
          },
          data: {
            message: `You earned 1 coin for completing 5 days in a row.`,
          },
        });
      }
    }
  }
};

export const UserRuleCalendarService = {
  createUserRuleCalendarToDB,
  getMyCalendarDataFromDB,
  updateCalendarDataToDB,
  updateUserRuleCalendarData,
};
