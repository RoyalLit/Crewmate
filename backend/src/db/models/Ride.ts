import type { Document, Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface IRide extends Document {
  posterId: Types.ObjectId;
  fromCity: string;
  toCity: string;
  departureDate: string; // ISO String (YYYY-MM-DD)
  departureTime: string; // HH:mm format
  arrivalTime: string; // HH:mm format
  stops: string[]; // Intermediate cities
  totalSeats: number;
  availableSeats: number;
  farePerSeat: number;
  cabType: 'Hatchback' | 'Sedan' | 'SUV' | 'MUV' | 'Any' | 'Other';
  status: 'active' | 'cancelled' | 'expired' | 'full';
  createdAt: Date;
  updatedAt: Date;
}

const rideSchema = new Schema<IRide>(
  {
    posterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fromCity: { type: String, required: true, trim: true },
    toCity: { type: String, required: true, trim: true },
    departureDate: { type: String, required: true, index: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    stops: [{ type: String, trim: true }],
    totalSeats: { type: Number, required: true, min: 1, max: 7 },
    availableSeats: { type: Number, required: true, min: 0, max: 7 },
    farePerSeat: { type: Number, required: true, min: 0 },
    cabType: {
      type: String,
      required: true,
      enum: ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Any', 'Other'],
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for searching rides
rideSchema.index({ fromCity: 1, toCity: 1, departureDate: 1, status: 1 });

export const RideModel = model<IRide>('Ride', rideSchema);
