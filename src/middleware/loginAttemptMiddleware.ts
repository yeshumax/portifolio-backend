import { Request, Response, NextFunction } from 'express';

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const loginAttempts: { [key: string]: LoginAttempt } = {};

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

const cleanupAttempts = () => {
  const now = Date.now();
  Object.keys(loginAttempts).forEach(key => {
    if (loginAttempts[key].lastAttempt < now - ATTEMPT_WINDOW && !loginAttempts[key].blockedUntil) {
      delete loginAttempts[key];
    } else if (loginAttempts[key].blockedUntil && loginAttempts[key].blockedUntil < now) {
      delete loginAttempts[key];
    }
  });
};

// Clean up every 5 minutes
setInterval(cleanupAttempts, 5 * 60 * 1000);

export const trackLoginAttempt = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  const now = Date.now();
  
  if (!email) {
    return next();
  }

  const key = email.toLowerCase();
  
  // Initialize or get existing attempt record
  if (!loginAttempts[key] || loginAttempts[key].lastAttempt < now - ATTEMPT_WINDOW) {
    loginAttempts[key] = {
      count: 0,
      lastAttempt: now
    };
  }

  // Check if user is currently blocked
  if (loginAttempts[key].blockedUntil && loginAttempts[key].blockedUntil > now) {
    const remainingTime = Math.ceil((loginAttempts[key].blockedUntil! - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Account temporarily locked due to too many failed login attempts. Try again in ${remainingTime} seconds.`,
      retryAfter: remainingTime,
      isLocked: true
    });
  }

  // Increment attempt count
  loginAttempts[key].count++;
  loginAttempts[key].lastAttempt = now;

  // Check if max attempts reached
  if (loginAttempts[key].count >= MAX_ATTEMPTS) {
    loginAttempts[key].blockedUntil = now + BLOCK_DURATION;
    
    return res.status(429).json({
      success: false,
      message: `Account temporarily locked due to too many failed login attempts. Try again in ${Math.ceil(BLOCK_DURATION / 1000)} seconds.`,
      retryAfter: Math.ceil(BLOCK_DURATION / 1000),
      isLocked: true
    });
  }

  // Add headers for remaining attempts
  const remainingAttempts = MAX_ATTEMPTS - loginAttempts[key].count;
  res.setHeader('X-Login-Attempts-Remaining', remainingAttempts);

  next();
};

export const resetLoginAttempts = (email: string) => {
  const key = email.toLowerCase();
  delete loginAttempts[key];
};

export const getLoginAttempts = (email: string): LoginAttempt | undefined => {
  const key = email.toLowerCase();
  return loginAttempts[key];
};
