"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (decoded.type !== 'access') {
            res.status(401);
            throw new Error('Invalid token type');
        }
        const user = await User_1.default.findById(decoded.userId).select('-password');
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
exports.protect = protect;
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403);
        throw new Error('Not authorized as admin');
    }
};
exports.admin = admin;
