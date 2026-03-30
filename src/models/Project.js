import mongoose from 'mongoose';
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    techStack: [{ type: String, required: true }],
    githubLink: { type: String },
    liveLink: { type: String },
    image: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['Frontend', 'Backend', 'Fullstack', 'Design', 'Mobile App'],
        default: 'Frontend'
    },
}, {
    timestamps: true,
});
const Project = mongoose.model('Project', projectSchema);
export default Project;
