import mongoose from 'mongoose';
import { RideModel } from './src/db/models/Ride';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const time = now.toISOString().split('T')[1].slice(0, 5);
  
  const result = await RideModel.updateMany(
    {
      status: { $in: ['active', 'full'] },
      $or: [
        { departureDate: { $lt: today } },
        { departureDate: today, departureTime: { $lte: time } },
      ],
    },
    { $set: { status: 'expired' } }
  );
  
  console.log('Expired ' + result.modifiedCount + ' rides');
  process.exit(0);
}

run().catch(console.error);
