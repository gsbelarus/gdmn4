import { Schema, model, ObjectId } from 'mongoose';


interface IMembership {
  user: ObjectId;
  organization: ObjectId;
  role: string
};

const membershipSchema = new Schema<IMembership>({
    user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
  },
  organization: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization',
  }, 
  role: {
    type: String, 
    required: true
  }
}, {autoIndex: false});

export const Membership = model<IMembership>('Membership', membershipSchema);