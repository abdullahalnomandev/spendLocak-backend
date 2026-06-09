import { model, Schema } from 'mongoose';
import { IPackage, PackageModel } from './package.interface';

const packageSchema = new Schema<IPackage, PackageModel>(
  {
    coins: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Package = model<IPackage, PackageModel>('Package', packageSchema);
