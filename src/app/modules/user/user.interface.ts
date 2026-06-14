import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { USER_AUTH_PROVIDER } from './user.constant';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  mobile?: string;
  confirm_password?: string;
  password: string;
  role: USER_ROLES;
  canAccessFeature: boolean;
  status: 'active' | 'delete';
  verified: boolean;
  image: string;
  token?: string;
  enable_notification: boolean;
  plaid_access_token?: string;
  authorization?: {
    oneTimeCode: string;
    expireAt: Date;
  };
  preference: {
    motivation: Types.ObjectId;
    trigger: Types.ObjectId;
    budget: number;
  };
  coinBalance: number;
  currentStreak: number;
  google_id_token?: string;
  auth_provider: USER_AUTH_PROVIDER;
}

export interface UserModel extends Model<IUser> {
  isExistUserById(id: string): Promise<IUser | null>;
  isExistUserByEmail(email: string): Promise<IUser | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
}
