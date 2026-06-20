import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  college?: string;
  homeCity?: string;
  profilePhotoUrl?: string;
  studentIdPhotoUrl?: string;
  
  isEmailVerified: boolean;
  status: 'pending_id' | 'active' | 'suspended';
  
  otpCode?: string;
  otpExpiresAt?: Date;
  
  tokenVersion: number;
  refreshTokenHashes: string[];
  expoPushToken?: string;
  blockedUsers?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true 
    },
    password: { 
      type: String 
    },
    college: { 
      type: String, 
      trim: true 
    },
    homeCity: { 
      type: String, 
      trim: true 
    },
    profilePhotoUrl: { 
      type: String 
    },
    studentIdPhotoUrl: { 
      type: String 
    },
    isEmailVerified: { 
      type: Boolean, 
      required: true, 
      default: false 
    },
    status: { 
      type: String, 
      enum: ['pending_id', 'active', 'suspended'], 
      required: true, 
      default: 'active' 
    },
    otpCode: { 
      type: String 
    },
    otpExpiresAt: { 
      type: Date 
    },
    tokenVersion: {
      type: Number,
      required: true,
      default: 0
    },
    refreshTokenHashes: {
      type: [String],
      default: [],
    },
    blockedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  { 
    timestamps: true 
  }
);

// Email index is implicitly created by unique: true on the schema definition

// Supports: UserRepository.findActiveUsers()
UserSchema.index({ status: 1 });

export const UserModel = model<IUser>('User', UserSchema);
