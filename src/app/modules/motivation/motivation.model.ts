import { model, Schema } from 'mongoose';
import { IMotivation, MotivationModel } from './motivation.interface';

const motivationSchema = new Schema<IMotivation, MotivationModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Motivation = model<IMotivation, MotivationModel>(
  'Motivation',
  motivationSchema
);
