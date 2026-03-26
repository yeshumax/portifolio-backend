import mongoose, { Document, Model } from 'mongoose';
import { IUser } from './User';

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  message: string;
  type: 'feedback' | 'complaint' | 'request';
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  adminResponse?: string;
  isReadByAdmin: boolean;
  isReadByUser: boolean;
}

const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    message: { type: String, required: true },
    type: { type: String, required: true, enum: ['feedback', 'complaint', 'request'] },
    status: { type: String, required: true, enum: ['pending', 'approved', 'rejected', 'resolved'], default: 'pending' },
    adminResponse: { type: String },
    isReadByAdmin: { type: Boolean, default: false },
    isReadByUser: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
