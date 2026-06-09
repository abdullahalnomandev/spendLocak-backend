import { Document, Model, Schema } from 'mongoose';

export interface IUserRuleCalendar extends Document {
  date: string;
  status: 'progress' | 'break' | 'stop';
  user: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRuleCalendarModel = Model<IUserRuleCalendar>;
