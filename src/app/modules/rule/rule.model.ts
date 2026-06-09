import { model, Schema } from 'mongoose';
import { IRule, RuleModel } from './rule.interface';

const ruleSchema = new Schema<IRule, RuleModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ruleType: {
      type: String,
      enum: ['time_based', 'limit_based'],
      required: true,
    },
    category: {
      type: String,
      enum: ['food', 'shop', 'travel', 'custom'],
      required: true,
    },
    ruleName: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    activeDays: {
      type: [String],
    },
    selectedApps: {
      type: [String],
    },
    spending_limit: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Rule = model<IRule, RuleModel>('Rule', ruleSchema);
