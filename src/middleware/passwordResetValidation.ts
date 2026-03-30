import { Request, Response, NextFunction } from 'express';

interface ValidationError {
  field: string;
  message: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 100) {
    errors.push('Password must be less than 100 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateForgotPassword = (req: Request, res: Response, next: NextFunction) => {
  const errors: ValidationError[] = [];
  const { email } = req.body;

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  } else if (email.length > 100) {
    errors.push({ field: 'email', message: 'Email must be less than 100 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateResetPassword = (req: Request, res: Response, next: NextFunction) => {
  const errors: ValidationError[] = [];
  const { email, token, newPassword } = req.body;

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  } else if (email.length > 100) {
    errors.push({ field: 'email', message: 'Email must be less than 100 characters' });
  }

  if (!token) {
    errors.push({ field: 'token', message: 'Reset token is required' });
  } else if (typeof token !== 'string' || token.length !== 64) {
    errors.push({ field: 'token', message: 'Invalid reset token format' });
  }

  if (!newPassword) {
    errors.push({ field: 'newPassword', message: 'New password is required' });
  } else {
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      passwordValidation.errors.forEach(error => {
        errors.push({ field: 'newPassword', message: error });
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateVerifyResetToken = (req: Request, res: Response, next: NextFunction) => {
  const errors: ValidationError[] = [];
  const { email, token } = req.body;

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  } else if (email.length > 100) {
    errors.push({ field: 'email', message: 'Email must be less than 100 characters' });
  }

  if (!token) {
    errors.push({ field: 'token', message: 'Reset token is required' });
  } else if (typeof token !== 'string' || token.length !== 64) {
    errors.push({ field: 'token', message: 'Invalid reset token format' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};
