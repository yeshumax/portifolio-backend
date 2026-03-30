"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.clearTokens = exports.setTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = (userId) => {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only';
    if (!process.env.JWT_SECRET) {
        console.warn('JWT_SECRET is not defined in environment variables. Using fallback for development.');
    }
    return jsonwebtoken_1.default.sign({ userId, type: 'access' }, jwtSecret, { expiresIn: '15m' });
};
const generateRefreshToken = (userId) => {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_for_development_only';
    if (!process.env.JWT_REFRESH_SECRET) {
        console.warn('JWT_REFRESH_SECRET is not defined in environment variables. Using fallback for development.');
    }
    return jsonwebtoken_1.default.sign({ userId, type: 'refresh' }, jwtRefreshSecret, { expiresIn: '7d' });
};
const setTokens = (res, userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    // Set access token in HTTP-only cookie
    res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { accessToken, refreshToken };
};
exports.setTokens = setTokens;
const clearTokens = (res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0),
    });
};
exports.clearTokens = clearTokens;
const verifyAccessToken = (token) => {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only';
    return jsonwebtoken_1.default.verify(token, jwtSecret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_for_development_only';
    return jsonwebtoken_1.default.verify(token, jwtRefreshSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
