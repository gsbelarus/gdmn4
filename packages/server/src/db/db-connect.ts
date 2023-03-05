import { connect } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function dbConnect() {
  try {
    await connect(process.env.DB_URL);
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (e) {
    console.log("Unable to connect to MongoDB Atlas!");
    console.error(e);
  }
};

