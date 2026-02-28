import mongoose, { Schema, InferSchemaType, HydratedDocument } from 'mongoose';

const ChatMsgSchema = new Schema(
  {
    repoId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Repo',
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

ChatMsgSchema.index({ repoId: 1, createdAt: -1 });
ChatMsgSchema.index({ repoId: 1, userId: 1 });
ChatMsgSchema.index({ userId: 1, content: 'text' });

export type ChatMsgDocType = InferSchemaType<typeof ChatMsgSchema>;
export type ChatMsgDocument = HydratedDocument<ChatMsgDocType>;

const ChatMsg = mongoose.model<ChatMsgDocument>('ChatMsg', ChatMsgSchema);
export default ChatMsg;