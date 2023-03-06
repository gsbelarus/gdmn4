import { Schema, model } from 'mongoose';

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
});

export const Organization = model<IOrganization>('Organization', organizationSchema);