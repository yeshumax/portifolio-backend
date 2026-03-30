import mongoose, { Schema } from 'mongoose';
const messageSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    name: {
        type: String,
        required: function () {
            return !this.userId;
        },
    },
    email: {
        type: String,
        required: function () {
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
}, {
    timestamps: true,
});
// Indexes for better query performance
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ email: 1, createdAt: -1 });
messageSchema.index({ isReadByAdmin: 1 });
messageSchema.index({ isReadByUser: 1 });
const Message = mongoose.model('Message', messageSchema);
export default Message;
