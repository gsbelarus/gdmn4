import { Schema, model } from 'mongoose';
import { Membership } from './membershipModel';
import { ChatMessage } from './chatModel';

interface IUser {
  email: string;
  password: string;
  userName: string
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
  },
  userName: {
    type: String,
    required: true,
    default: "Anon"
  }
}).post('findOneAndDelete', async (document) => {
  await Membership.deleteMany({user: document._id});
  await ChatMessage.deleteMany({owner: document._id})
});

export const User = model<IUser>('User', userSchema);