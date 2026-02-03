import mongoose, { Schema, InferSchemaType, HydratedDocument } from 'mongoose';

const RepoSchema = new Schema(
  {
    owner: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    indexStatus: {
      type: String,
      enum: ['pending', 'indexing', 'indexed', 'failed'],
      default: 'pending',
      required: true,
    },
    indexError: {
      type: String,
      default: null,
    },
    defaultBranch: {
      type: String,
      default: null,
    },
    lastIndexedAt: {
      type: Date,
      default: null,
    },
    repoMap: {
      type: String,
      default: null,
    }
  },
  { timestamps: true }
);

RepoSchema.index({ owner: 1, name: 1, userId: 1 }, { unique: true });
RepoSchema.index({ owner: 1, name: 1 });

export type RepoDocType = InferSchemaType<typeof RepoSchema>;
export type RepoDocument = HydratedDocument<RepoDocType>;

const Repo = mongoose.model('Repo', RepoSchema);
export default Repo;
