"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const path_1 = __importDefault(require("path"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
// Import models to ensure they're registered with Mongoose
require("./models/User");
require("./models/Project");
require("./models/Skill");
require("./models/Message");
require("./models/AuditLog");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const skillRoutes_1 = __importDefault(require("./routes/skillRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const app = (0, express_1.default)();
const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/skills', skillRoutes_1.default);
app.use('/api/profile', profileRoutes_1.default);
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
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
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, db_1.default)();
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
