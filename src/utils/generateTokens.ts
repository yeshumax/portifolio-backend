import jwt from 'jsonwebtoken';
import { Response } from 'express';

interface TokenPayload {
  userId: string;
  type: 'access' | 'refresh';
}

const generateAccessToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only';
  
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is not defined in environment variables. Using fallback for development.');
  }
  
  return jwt.sign(
    { userId, type: 'access' } as TokenPayload,
    jwtSecret,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (userId: string): string => {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_for_development_only';
  
  if (!process.env.JWT_REFRESH_SECRET) {
    console.warn('JWT_REFRESH_SECRET is not defined in environment variables. Using fallback for development.');
  }
  
  return jwt.sign(
    { userId, type: 'refresh' } as TokenPayload,
    jwtRefreshSecret,
    { expiresIn: '7d' }
  );
};

export const setTokens = (res: Response, userId: string) => {
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

export const clearTokens = (res: Response) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only';
  return jwt.verify(token, jwtSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_for_development_only';
  return jwt.verify(token, jwtRefreshSecret) as TokenPayload;
};
