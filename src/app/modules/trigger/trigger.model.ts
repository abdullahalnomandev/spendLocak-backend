import { model, Schema } from 'mongoose';
import { ITrigger, TriggerModel } from './trigger.interface';

const triggerSchema = new Schema<ITrigger, TriggerModel>(
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

export const Trigger = model<ITrigger, TriggerModel>(
  'Trigger',
  triggerSchema
);
