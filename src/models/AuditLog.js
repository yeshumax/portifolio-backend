import mongoose from 'mongoose';
const auditLogSchema = new mongoose.Schema({
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
}, {
    timestamps: true,
});
const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
