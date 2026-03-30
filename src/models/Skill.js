import mongoose from 'mongoose';
const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    level: {
        type: Number,
        required: true,
        default: 0,
    },
    category: {
        type: String,
        required: true,
        enum: ['frontend', 'backend', 'design', 'tools'],
        default: 'frontend',
    },
    years: {
        type: Number,
        required: true,
        default: 0,
    },
    color: {
        type: String,
        required: true,
        default: 'bg-blue-500',
    },
}, {
    timestamps: true,
});
const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
