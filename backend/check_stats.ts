import mongoose from 'mongoose';
import { RideModel } from './src/db/models/Ride';
import { RideRequestModel } from './src/db/models/RideRequest';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  const users = await mongoose.connection.collection('users').find({}).toArray();
  for (const u of users) {
    const ridesGiven = await RideModel.countDocuments({ posterId: u._id, status: 'expired' });
    const ridesTaken = await RideRequestModel.countDocuments({ requesterId: u._id, status: 'accepted' });
    console.log(`User: ${u.email} | Given: ${ridesGiven} | Taken: ${ridesTaken}`);
  }
  process.exit(0);
}
run().catch(console.error);
