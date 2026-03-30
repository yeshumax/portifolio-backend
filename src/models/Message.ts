import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  userId?: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  type: 'feedback' | 'request' | 'complaint' | 'collaboration' | 'question';
  message: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'approved' | 'rejected';
  adminResponse?: string;
  read: boolean;
  isReadByAdmin: boolean;
  isReadByUser: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      required: function (this: IMessage) {
        return !this.userId;
      },
    },
    email: {
      type: String,
      required: function (this: IMessage) {
        return !this.userId;
      },
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['feedback', 'request', 'complaint', 'collaboration', 'question'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'approved', 'rejected'],
      default: 'pending',
    },
    adminResponse: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
    },
    isReadByAdmin: {
      type: Boolean,
      default: false,
    },
    isReadByUser: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ email: 1, createdAt: -1 });
messageSchema.index({ isReadByAdmin: 1 });
messageSchema.index({ isReadByUser: 1 });

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;