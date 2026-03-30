import jwt from 'jsonwebtoken';
import User from '../models/User';
export const protect = async (req, res, next) => {
    let token;
    if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }
    else if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
    try {
        const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only';
        if (!process.env.JWT_SECRET) {
            console.warn('JWT_SECRET is not defined in environment variables. Using fallback for development.');
        }
        const decoded = jwt.verify(token, jwtSecret);
        if (decoded.type !== 'access') {
            res.status(401);
            throw new Error('Invalid token type');
        }
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(401);
            throw new Error('User not found');
        }
        if (user.isBlocked) {
            res.status(401);
            throw new Error('User is blocked');
        }
        if (!user.isActive) {
            res.status(401);
            throw new Error('User account is not active');
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(401);
            throw new Error('Invalid token');
        }
        else if (error.name === 'TokenExpiredError') {
            res.status(401);
            throw new Error('Token expired');
        }
        else {
            res.status(401);
            throw new Error('Not authorized');
        }
    }
};
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403);
        throw new Error('Not authorized as admin');
    }
};
