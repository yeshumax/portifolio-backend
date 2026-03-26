import mongoose, { Document, Model } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  techStack: string[];
  githubLink?: string;
  liveLink?: string;
  image: string;
  type: 'Frontend' | 'Backend' | 'Fullstack' | 'Design' | 'Mobile App';
}

const projectSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const Project: Model<IProject> = mongoose.model<IProject>('Project', projectSchema);
export default Project;
