import { Schema, model } from 'mongoose';
import { Membership } from './membershipModel';

interface IOrganization {
  name: string;
};

const organizationSchema = new Schema<IOrganization>({
  name: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true
  },
}).post('findOneAndDelete', async (document) => {
  await Membership.deleteMany({organization: document._id})
});

export const Organization = model<IOrganization>('Organization', organizationSchema);