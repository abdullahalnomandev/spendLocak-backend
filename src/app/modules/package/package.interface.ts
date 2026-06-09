import { Document, Model } from 'mongoose';

export interface IPackage extends Document {
  coins: number;
  price: number;
  discount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PackageModel = Model<IPackage>;
