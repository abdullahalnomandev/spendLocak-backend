import { model, Schema } from 'mongoose';
import { IUserRuleCalendar, UserRuleCalendarModel } from './userRuleCalendar.interface';

const userRuleCalendarSchema = new Schema<IUserRuleCalendar, UserRuleCalendarModel>(
  {
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['progress', 'break', 'stop'],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const UserRuleCalendar = model<IUserRuleCalendar, UserRuleCalendarModel>(
  'UserRuleCalendar',
  userRuleCalendarSchema
);
