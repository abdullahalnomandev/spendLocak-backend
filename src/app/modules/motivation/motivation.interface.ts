import { Document, Model } from 'mongoose';

export interface IMotivation extends Document {
  title: string;
  image: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MotivationModel = Model<IMotivation>;
