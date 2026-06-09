import { model, Schema } from 'mongoose';
import { ICoinHistory, CoinHistoryModel } from './coinHistory.interface';

const coinHistorySchema = new Schema<ICoinHistory, CoinHistoryModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['BUY', 'EARN', 'SPEND'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String
    },
    coins: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const CoinHistory = model<ICoinHistory, CoinHistoryModel>(
  'CoinHistory',
  coinHistorySchema
);
