import { Document, Model } from 'mongoose';

export interface ITrigger extends Document {
  title: string;
  image: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TriggerModel = Model<ITrigger>;
