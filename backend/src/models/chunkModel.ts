import mongoose, { Schema, InferSchemaType, HydratedDocument } from 'mongoose';

const ChunkSchema = new Schema(
  {
    repoId: {
      type: Schema.Types.ObjectId,
      ref: 'Repo',
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    startIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.length > 0,
      },
    },
  },
  { timestamps: true }
);

ChunkSchema.index({ repoId: 1 });
ChunkSchema.index({ repoId: 1, filePath: 1 });
ChunkSchema.index(
  { repoId: 1, filePath: 1, chunkIndex: 1 },
  { unique: true }
);

export type ChunkDocType = InferSchemaType<typeof ChunkSchema>;
export type ChunkDocument = HydratedDocument<ChunkDocType>;

const Chunk = mongoose.model('Chunk', ChunkSchema);
export default Chunk;
