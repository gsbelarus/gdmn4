import { Schema, model } from 'mongoose';

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
});

export const User = model<IUser>('User', userSchema);