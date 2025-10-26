import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  githubId: string;
  username: string;
  displayName?: string;
  profileUrl?: string;
  avatarUrl?: string;
  email?: string;
  tokenVersion: number;
  lastLogin?: Date;
}

const userSchema = new Schema<IUser>({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  displayName: String,
  profileUrl: String,
  avatarUrl: String,
  email: String,
  tokenVersion: { type: Number, default: 0 },
  lastLogin: { type: Date },
}, {
  timestamps: true,
});

export const User = mongoose.model<IUser>('User', userSchema);
