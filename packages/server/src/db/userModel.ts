import { Schema, model } from 'mongoose';
import { Membership } from './membershipModel';

interface IUser {
  email: string;
  password: string;
};

const userSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 1 
  }
}).post('findOneAndDelete', async (document) => {
  await Membership.deleteMany({user: document._id})
});

export const User = model<IUser>('User', userSchema);