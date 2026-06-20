import type { Document, Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface IRideRequest extends Document {
  rideId: Types.ObjectId;
  requesterId: Types.ObjectId;
  posterId: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

const rideRequestSchema = new Schema<IRideRequest>(
  {
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    posterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from requesting the same ride twice
rideRequestSchema.index({ rideId: 1, requesterId: 1 }, { unique: true });

export const RideRequestModel = model<IRideRequest>('RideRequest', rideRequestSchema);
