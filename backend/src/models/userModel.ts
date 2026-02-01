import mongoose, { Schema, InferSchemaType, HydratedDocument } from 'mongoose';

const UserSchema = new Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      default: null,
      trim: true,
    },
    profileUrl: {
      type: String,
      default: null,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    tokenVersion: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export type UserDocType = InferSchemaType<typeof UserSchema>;
export type UserDocument = HydratedDocument<UserDocType>;

const User = mongoose.model<UserDocument>('User', UserSchema);
export default User;
