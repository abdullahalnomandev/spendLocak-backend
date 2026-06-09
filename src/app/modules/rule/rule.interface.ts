import { Document, Model, Schema } from 'mongoose';

export interface IRule extends Document {
  user: Schema.Types.ObjectId;
  ruleType: 'time_based' | 'limit_based';
  category: 'food' | 'shop' | 'travel' | 'custom';
  ruleName: string;
  startTime?: string;
  endTime?: string;
  activeDays?: string[];
  selectedApps?: string[];
  spending_limit?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type RuleModel = Model<IRule>;
