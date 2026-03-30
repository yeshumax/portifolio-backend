import jwt from 'jsonwebtoken';
const generateAccessToken = (userId) => {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only';
    if (!process.env.JWT_SECRET) {
        console.warn('JWT_SECRET is not defined in environment variables. Using fallback for development.');
    }
    return jwt.sign({ userId, type: 'access' }, jwtSecret, { expiresIn: '15m' });
};
const generateRefreshToken = (userId) => {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_for_development_only';
    if (!process.env.JWT_REFRESH_SECRET) {
        console.warn('JWT_REFRESH_SECRET is not defined in environment variables. Using fallback for development.');
    }
    return jwt.sign({ userId, type: 'refresh' }, jwtRefreshSecret, { expiresIn: '7d' });
};
export const setTokens = (res, userId) => {
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
export const clearTokens = (res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0),
    });
};
export const verifyAccessToken = (token) => {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only';
    return jwt.verify(token, jwtSecret);
};
export const verifyRefreshToken = (token) => {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_for_development_only';
    return jwt.verify(token, jwtRefreshSecret);
};
