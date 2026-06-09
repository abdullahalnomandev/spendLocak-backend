import { Document, Model, Schema } from 'mongoose';

export interface ICoinHistory extends Document {
  user: Schema.Types.ObjectId;
  type: 'BUY' | 'EARN' | 'SPEND';
  title: string;
  description: string;
  coins: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CoinHistoryModel = Model<ICoinHistory>;
