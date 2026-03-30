import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import path from 'path';
import { notFound, errorHandler } from './middleware/errorMiddleware';
// Import models to ensure they're registered with Mongoose
import './models/User';
import './models/Project';
import './models/Skill';
import './models/Message';
import './models/AuditLog';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import messageRoutes from './routes/messageRoutes';
import skillRoutes from './routes/skillRoutes';
import profileRoutes from './routes/profileRoutes';
const app = express();
const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/profile', profileRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get('/', (req, res) => {
    res.send('API is running...');
});
// Development endpoint to clear rate limits
if (process.env.NODE_ENV === 'development') {
    app.post('/dev/clear-rate-limits', (req, res) => {
        const { clearRateLimits } = require('./middleware/rateLimitMiddleware');
        clearRateLimits();
        res.json({ message: 'Rate limits cleared' });
    });
    app.post('/dev/reseed-database', async (req, res) => {
        try {
            const mongoose = require('mongoose');
            const User = require('./models/User').default;
            const Project = require('./models/Project').default;
            const Skill = require('./models/Skill').default;
            await User.deleteMany({});
            await Project.deleteMany({});
            await Skill.deleteMany({});
            res.json({ message: 'Database cleared and reseeded successfully' });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to reseed database' });
        }
    });
    app.post('/dev/bypass-validation', (req, res) => {
        res.json({ message: 'Validation bypassed for development' });
    });
}
// Password strength check endpoint
app.post('/api/check-password-strength', (req, res) => {
    const { checkPasswordStrength } = require('./middleware/validationMiddleware');
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required'
        });
    }
    const strengthAnalysis = checkPasswordStrength(password);
    res.json({
        success: true,
        strength: strengthAnalysis.strength,
        feedback: strengthAnalysis.feedback
    });
});
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
