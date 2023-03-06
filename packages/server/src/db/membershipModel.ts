import { Schema, model, ObjectId } from 'mongoose';

interface IMembership {
  user_id: ObjectId;
  organization_id: ObjectId;
  role: string
};

const IMembership = new Schema<IMembership>({
    user_id: { 
    type: Schema.Types.ObjectId, 
    required: true,
    unique: true,
  },
  organization_id: { 
    type: Schema.Types.ObjectId, 
    required: true,
    unique: true,
  }, 
  role: {
    type: String, 
    required: true
  }
});

export const Membership = model<IMembership>('Membership', IMembership);