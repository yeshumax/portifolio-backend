import mongoose, { Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  performedBy: mongoose.Types.ObjectId;
  targetUser?: mongoose.Types.ObjectId;
  details: string;
  createdAt: Date;
}

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;
